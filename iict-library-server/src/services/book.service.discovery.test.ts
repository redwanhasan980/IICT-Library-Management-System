import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoanStatus, Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    book: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    loan: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('../utils/auditLog', () => ({ logAuditEvent: vi.fn() }));

const { default: bookService } = await import('./book.service');

const book = {
  id: 'book-1',
  title: 'Database Systems',
  author: 'Elmasri',
  accessionNumber: 'ACC-1',
  availableCopies: 1,
  totalCopies: 1,
  isArchived: false,
  department: 'SWE',
  subjectCategory: 'Database',
  deweyDecimalNumber: 5,
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('bookService discovery methods', () => {
  it('returns public catalog metadata with pagination', async () => {
    mocks.prisma.book.findMany.mockResolvedValue([book]);
    mocks.prisma.book.count.mockResolvedValue(1);

    const result = await bookService.listPublicBooks({ q: 'database', page: 1, pageSize: 12 });

    expect(result.total).toBe(1);
    expect(result.items[0].accessionNumber).toBe('ACC-1');
    expect(mocks.prisma.book.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ isArchived: false, OR: expect.any(Array) }),
      take: 12,
    }));
  });

  it('orders popular books from loan counts', async () => {
    mocks.prisma.loan.groupBy.mockResolvedValue([{ bookId: 'book-1', _count: { bookId: 3 } }]);
    mocks.prisma.book.findMany.mockResolvedValue([book]);

    const result = await bookService.listPopularBooks({ limit: 5 });

    expect(result[0].loanCount).toBe(3);
    expect(mocks.prisma.loan.groupBy).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
  });

  it('uses borrowing history for recommendations when available', async () => {
    mocks.prisma.loan.findMany.mockResolvedValue([{
      id: 'loan-1',
      bookId: 'book-1',
      userId: 'student-1',
      borrowerRole: Role.STUDENT,
      status: LoanStatus.RETURNED,
      issuedAt: new Date(),
      dueAt: new Date(),
      returnedAt: new Date(),
      book,
    }]);
    mocks.prisma.book.findMany.mockResolvedValue([{ ...book, id: 'book-2', accessionNumber: 'ACC-2' }]);

    const result = await bookService.listRecommendedBooks('student-1', { limit: 4 });

    expect(result[0].id).toBe('book-2');
    expect(mocks.prisma.book.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: { notIn: ['book-1'] },
        OR: expect.any(Array),
      }),
      take: 4,
    }));
  });

  it('falls back to recent books when recommendation history is empty', async () => {
    mocks.prisma.loan.findMany.mockResolvedValue([]);
    mocks.prisma.book.findMany.mockResolvedValue([book]);

    const result = await bookService.listRecommendedBooks('student-1', { limit: 3 });

    expect(result).toEqual([book]);
    expect(mocks.prisma.book.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isArchived: false },
      take: 3,
    }));
  });
});
