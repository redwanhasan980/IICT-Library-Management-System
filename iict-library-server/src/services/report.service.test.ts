import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoanStatus, Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    loan: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));

const { default: reportService } = await import('./report.service');

const overdueLoan = {
  id: 'loan-1',
  bookId: 'book-1',
  userId: 'student-1',
  borrowerRole: Role.STUDENT,
  issuedAt: new Date('2026-04-01T00:00:00.000Z'),
  dueAt: new Date('2026-04-05T00:00:00.000Z'),
  returnedAt: null,
  status: LoanStatus.ACTIVE,
  book: {
    accessionNumber: 'ACC-1',
    title: 'Database Systems',
    author: 'Elmasri',
    department: 'SWE',
  },
  user: {
    name: 'Student One',
    email: 'student@example.com',
    role: Role.STUDENT,
    student: { studentRegNumber: 'REG-1', department: 'SWE' },
    teacher: null,
  },
  issuedBy: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' },
  returnedBy: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reportService', () => {
  it('returns issued-book report rows with computed overdue status', async () => {
    mocks.prisma.loan.findMany
      .mockResolvedValueOnce([overdueLoan])
      .mockResolvedValueOnce([{
        id: 'loan-1',
        userId: 'student-1',
        status: LoanStatus.ACTIVE,
        dueAt: new Date('2026-04-05T00:00:00.000Z'),
        returnedAt: null,
      }]);
    mocks.prisma.loan.count.mockResolvedValue(1);

    const report = await reportService.getIssuedBooksReport({
      from: '2026-04-01',
      to: '2026-04-30',
      borrowerRole: Role.STUDENT,
      q: 'Database',
      page: 1,
      pageSize: 10,
    });

    expect(report.total).toBe(1);
    expect(report.summary.uniqueBorrowers).toBe(1);
    expect(report.items[0].accessionNumber).toBe('ACC-1');
    expect(report.items[0].effectiveStatus).toBe(LoanStatus.OVERDUE);
    expect(mocks.prisma.loan.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        borrowerRole: Role.STUDENT,
        OR: expect.any(Array),
      }),
      take: 10,
    }));
  });

  it('applies overdue report filter as active loans past due date', async () => {
    mocks.prisma.loan.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    mocks.prisma.loan.count.mockResolvedValue(0);

    await reportService.getIssuedBooksReport({ status: LoanStatus.OVERDUE });

    expect(mocks.prisma.loan.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        status: LoanStatus.ACTIVE,
        returnedAt: null,
        dueAt: expect.objectContaining({ lt: expect.any(Date) }),
      }),
    });
  });
});
