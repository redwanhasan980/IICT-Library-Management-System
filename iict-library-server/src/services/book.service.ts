import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

interface CreateBookInput {
  title: string;
  author: string;
  accessionNumber: string;
  isbn?: string;
  department?: string;
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
        isbn: payload.isbn,
        department: payload.department,
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
