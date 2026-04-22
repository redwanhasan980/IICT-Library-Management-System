import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

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
  procurementId?: string;
  totalCopies?: number;
}

interface ListBooksQuery {
  q?: string;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

class BookService {
  async createBook(actorId: string, payload: CreateBookInput) {
    const exists = await prisma.book.findUnique({
      where: { accessionNumber: payload.accessionNumber },
      select: { id: true },
    });

    if (exists) {
      throw new AppError('A book already exists with this accession number', 409);
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
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;

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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getBookById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
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

    return book;
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
