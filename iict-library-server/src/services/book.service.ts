import type { BookImage } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import { getPrimaryBookImage, mapBookImage } from './bookImage.service';

interface CreateBookInput {
  title: string;
  author: string;
  accessionNumber: string;
  authorEditor?: string;
  edition?: string;
  volume?: string;
  placeOfPublication?: string;
  publisher?: string;
  dateOfPublication?: string;
  source?: 'PURCHASE' | 'DONATION' | 'GIFT';
  binding?: 'PB' | 'HB';
  pagination?: number;
  billNumber?: string;
  billDate?: string;
  isbn?: string;
  department?: 'CSE' | 'SWE' | 'EEE';
  subjectCategory?: string;
  deweyDecimalNumber?: number;
  cutterCode?: string;
  callNumber?: string;
  locationCode?: string;
  catalogEntryDate?: string;
  catalogedById?: string;
  barcode?: string;
  coverImageUrl?: string;
  procurementId?: string;
  totalCopies?: number;
}

interface ListBooksQuery {
  q?: string;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

interface PublicBookQuery {
  q?: string;
  page?: number;
  pageSize?: number;
}

interface BookLimitQuery {
  limit?: number;
}

class BookService {
  private imageOrderBy() {
    return [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];
  }

  private decorateBookListItem<T extends { images?: BookImage[] }>(book: T) {
    const { images, ...rest } = book;
    return {
      ...rest,
      primaryImage: getPrimaryBookImage(images),
    };
  }

  private decorateBookDetail<T extends { images?: BookImage[] }>(book: T) {
    const { images = [], ...rest } = book;
    const mappedImages = images.map(mapBookImage);

    return {
      ...rest,
      images: mappedImages,
      primaryImage: mappedImages.find((image) => image.isPrimary) ?? mappedImages[0],
    };
  }

  private normalizePagination(query: { page?: number; pageSize?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    return {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
    };
  }

  private normalizeLimit(limit?: number) {
    return limit && limit > 0 ? Math.min(limit, 20) : 8;
  }

  private publicBookWhere(query: PublicBookQuery = {}) {
    return {
      isArchived: false,
      OR: query.q
        ? [
            { title: { contains: query.q } },
            { author: { contains: query.q } },
            { accessionNumber: { contains: query.q } },
            { callNumber: { contains: query.q } },
            { subjectCategory: { contains: query.q } },
          ]
        : undefined,
    };
  }

  async createBook(actorId: string, payload: CreateBookInput) {
    const exists = await prisma.book.findUnique({
      where: { accessionNumber: payload.accessionNumber },
      select: { id: true },
    });

    if (exists) {
      throw new AppError('A book already exists with this accession number', 409);
    }

    if (payload.barcode) {
      const barcodeExists = await prisma.book.findFirst({
        where: { barcode: payload.barcode },
        select: { id: true },
      });
      if (barcodeExists) {
        throw new AppError('A book already exists with this barcode', 409);
      }
    }

    const totalCopies = payload.totalCopies ?? 1;

    const created = await prisma.book.create({
      data: {
        title: payload.title,
        author: payload.author,
        accessionNumber: payload.accessionNumber,
        authorEditor: payload.authorEditor ?? payload.author,
        edition: payload.edition,
        volume: payload.volume,
        placeOfPublication: payload.placeOfPublication,
        publisher: payload.publisher,
        dateOfPublication: payload.dateOfPublication ? new Date(payload.dateOfPublication) : undefined,
        source: payload.source,
        binding: payload.binding,
        pagination: payload.pagination,
        billNumber: payload.billNumber,
        billDate: payload.billDate ? new Date(payload.billDate) : undefined,
        isbn: payload.isbn,
        department: payload.department,
        subjectCategory: payload.subjectCategory,
        deweyDecimalNumber: payload.deweyDecimalNumber,
        cutterCode: payload.cutterCode,
        callNumber: payload.callNumber,
        locationCode: payload.locationCode,
        catalogEntryDate: payload.catalogEntryDate ? new Date(payload.catalogEntryDate) : undefined,
        catalogedById: payload.catalogedById,
        barcode: payload.barcode,
        coverImageUrl: payload.coverImageUrl,
        procurementId: payload.procurementId,
        totalCopies,
        availableCopies: totalCopies,
      },
    });

    logAuditEvent({
      action: 'book.create',
      actorId,
      entity: 'Book',
      entityId: created.id,
      details: { accessionNumber: created.accessionNumber },
    });

    return created;
  }

  async listBooks(query: ListBooksQuery) {
    const { page, pageSize, skip } = this.normalizePagination(query);

    const where = {
      isArchived: query.includeArchived ? undefined : false,
      OR: query.q
        ? [
            { title: { contains: query.q } },
            { author: { contains: query.q } },
            { accessionNumber: { contains: query.q } },
            { callNumber: { contains: query.q } },
            { barcode: { contains: query.q } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        include: { images: { orderBy: this.imageOrderBy() } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      items: items.map((item) => this.decorateBookListItem(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listPublicBooks(query: PublicBookQuery) {
    const { page, pageSize, skip } = this.normalizePagination(query);
    const where = this.publicBookWhere(query);

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        include: { images: { orderBy: this.imageOrderBy() } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      items: items.map((item) => this.decorateBookListItem(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listRecentBooks(query: BookLimitQuery = {}) {
    const books = await prisma.book.findMany({
      where: { isArchived: false },
      take: this.normalizeLimit(query.limit),
      include: { images: { orderBy: this.imageOrderBy() } },
      orderBy: [{ createdAt: 'desc' }],
    });

    return books.map((book) => this.decorateBookListItem(book));
  }

  async listFeaturedBooks(query: BookLimitQuery = {}) {
    const books = await prisma.book.findMany({
      where: {
        isArchived: false,
        availableCopies: { gt: 0 },
      },
      take: this.normalizeLimit(query.limit),
      include: { images: { orderBy: this.imageOrderBy() } },
      orderBy: [{ availableCopies: 'desc' }, { createdAt: 'desc' }],
    });

    return books.map((book) => this.decorateBookListItem(book));
  }

  async listPopularBooks(query: BookLimitQuery = {}) {
    const limit = this.normalizeLimit(query.limit);
    const loanGroups = await prisma.loan.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take: limit,
    });

    const bookIds = loanGroups.map((group) => group.bookId);
    if (bookIds.length === 0) {
      return [];
    }

    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
        isArchived: false,
      },
      include: { images: { orderBy: this.imageOrderBy() } },
    });

    const booksById = new Map(books.map((book) => [book.id, book]));

    return loanGroups
      .map((group) => {
        const book = booksById.get(group.bookId);
        return book ? { ...this.decorateBookListItem(book), loanCount: group._count.bookId } : null;
      })
      .filter((book): book is NonNullable<typeof book> => Boolean(book));
  }

  async listRecommendedBooks(userId: string, query: BookLimitQuery = {}) {
    const limit = this.normalizeLimit(query.limit);
    const history = await prisma.loan.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { issuedAt: 'desc' },
      take: 20,
    });

    if (history.length === 0) {
      return this.listRecentBooks({ limit });
    }

    const borrowedBookIds = history.map((loan) => loan.bookId);
    const departments = [...new Set(history.map((loan) => loan.book.department).filter(Boolean))];
    const subjects = [...new Set(history.map((loan) => loan.book.subjectCategory).filter(Boolean))];
    const authors = [...new Set(history.map((loan) => loan.book.author).filter(Boolean))];
    const ddcRanges = [
      ...new Set(
        history
          .map((loan) => (loan.book.deweyDecimalNumber ? Number(loan.book.deweyDecimalNumber) : undefined))
          .filter((value): value is number => Number.isFinite(value))
          .map((value) => Math.floor(value / 100) * 100)
      ),
    ];

    const recommendationWhere = {
      isArchived: false,
      id: { notIn: borrowedBookIds },
      OR: [
        ...departments.map((department) => ({ department })),
        ...subjects.map((subjectCategory) => ({ subjectCategory })),
        ...authors.map((author) => ({ author })),
        ...ddcRanges.map((prefix) => ({
          deweyDecimalNumber: {
            gte: prefix,
            lt: prefix + 100,
          },
        })),
      ],
    };

    const recommendations = recommendationWhere.OR.length
      ? await prisma.book.findMany({
          where: recommendationWhere,
          take: limit,
          include: { images: { orderBy: this.imageOrderBy() } },
          orderBy: [{ availableCopies: 'desc' }, { createdAt: 'desc' }],
        })
      : [];

    return recommendations.length > 0
      ? recommendations.map((book) => this.decorateBookListItem(book))
      : this.listRecentBooks({ limit });
  }

  async getBookById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        images: { orderBy: this.imageOrderBy() },
        reservations: {
          where: { status: 'PENDING' },
          orderBy: { queueNumber: 'asc' },
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return this.decorateBookDetail(book);
  }

  async updateBook(actorId: string, id: string, payload: Partial<CreateBookInput>) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (payload.accessionNumber && payload.accessionNumber !== book.accessionNumber) {
      const exists = await prisma.book.findUnique({
        where: { accessionNumber: payload.accessionNumber },
        select: { id: true },
      });
      if (exists) {
        throw new AppError('Another book already exists with this accession number', 409);
      }
    }

    if (payload.barcode && payload.barcode !== book.barcode) {
      const barcodeExists = await prisma.book.findFirst({
        where: { barcode: payload.barcode },
        select: { id: true },
      });
      if (barcodeExists) {
        throw new AppError('Another book already exists with this barcode', 409);
      }
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: payload.title,
        author: payload.author,
        accessionNumber: payload.accessionNumber,
        authorEditor: payload.authorEditor,
        edition: payload.edition,
        volume: payload.volume,
        placeOfPublication: payload.placeOfPublication,
        publisher: payload.publisher,
        dateOfPublication: payload.dateOfPublication ? new Date(payload.dateOfPublication) : undefined,
        source: payload.source,
        binding: payload.binding,
        pagination: payload.pagination,
        billNumber: payload.billNumber,
        billDate: payload.billDate ? new Date(payload.billDate) : undefined,
        isbn: payload.isbn,
        department: payload.department,
        subjectCategory: payload.subjectCategory,
        deweyDecimalNumber: payload.deweyDecimalNumber,
        cutterCode: payload.cutterCode,
        callNumber: payload.callNumber,
        locationCode: payload.locationCode,
        catalogEntryDate: payload.catalogEntryDate ? new Date(payload.catalogEntryDate) : undefined,
        catalogedById: payload.catalogedById,
        barcode: payload.barcode,
        coverImageUrl: payload.coverImageUrl,
        procurementId: payload.procurementId,
        totalCopies: payload.totalCopies,
        availableCopies: payload.totalCopies, // We might need to handle this more intelligently if loans are active, but for basic single-copy modeling this works
      },
    });

    logAuditEvent({
      action: 'book.update',
      actorId,
      entity: 'Book',
      entityId: updated.id,
    });

    return updated;
  }

  async getByAccession(accessionNumber: string) {
    const book = await prisma.book.findUnique({
      where: { accessionNumber },
    });

    if (!book) {
      throw new AppError('Book not found for given accession number', 404);
    }

    return book;
  }

  async setArchiveStatus(actorId: string, id: string, isArchived: boolean) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const updated = await prisma.book.update({
      where: { id },
      data: { isArchived },
    });

    logAuditEvent({
      action: isArchived ? 'book.archive' : 'book.unarchive',
      actorId,
      entity: 'Book',
      entityId: id,
    });

    return updated;
  }
}

export default new BookService();
