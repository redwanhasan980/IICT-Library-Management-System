import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoanStatus, Role } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const prisma = {
    user: { findUnique: vi.fn() },
    studentProfile: { findUnique: vi.fn() },
    teacherProfile: { findUnique: vi.fn() },
    book: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    loan: {
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    systemSetting: { upsert: vi.fn() },
    $transaction: vi.fn(),
  };

  return { prisma };
});

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('../utils/auditLog', () => ({ logAuditEvent: vi.fn() }));
vi.mock('./reservation.service', () => ({
  default: { fulfillNextPendingReservation: vi.fn() },
}));

const { default: loanService } = await import('./loan.service');

const studentUser = {
  id: 'student-user',
  name: 'Student One',
  email: 'student@example.com',
  role: Role.STUDENT,
  student: { id: 'student-profile', department: 'SWE', studentRegNumber: 'REG-1' },
  teacher: null,
};

const teacherUser = {
  id: 'teacher-user',
  name: 'Teacher One',
  email: 'teacher@example.com',
  role: Role.TEACHER,
  student: null,
  teacher: { id: 'teacher-profile', department: 'SWE', teacherId: 'T-1', signatureData: null },
};

const activeBook = {
  id: 'book-1',
  title: 'Algorithms',
  author: 'Knuth',
  accessionNumber: 'ACC-1',
  availableCopies: 1,
  isArchived: false,
};

const policy = {
  studentBorrowDurationDays: 14,
  teacherBorrowDurationDays: 30,
  maxActiveLoansStudent: 3,
  maxActiveLoansTeacher: 5,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.systemSetting.upsert.mockResolvedValue(policy);
  mocks.prisma.$transaction.mockImplementation((callback) => callback(mocks.prisma));
});

describe('loanService circulation rules', () => {
  it('issues a book to a student by accession number', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(studentUser);
    mocks.prisma.book.findUnique.mockResolvedValue(activeBook);
    mocks.prisma.loan.count.mockResolvedValue(0);
    mocks.prisma.loan.findFirst.mockResolvedValue(null);
    mocks.prisma.book.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.loan.create.mockResolvedValue({
      id: 'loan-1',
      bookId: activeBook.id,
      userId: studentUser.id,
      borrowerRole: Role.STUDENT,
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 86400000),
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      book: activeBook,
      user: studentUser,
    });

    const result = await loanService.issueLoan({
      accessionNumber: activeBook.accessionNumber,
      userId: studentUser.id,
      issuedById: 'admin-1',
    });

    expect(result.status).toBe(LoanStatus.ACTIVE);
    expect(result.isOverdue).toBe(false);
    expect(mocks.prisma.book.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: activeBook.id, availableCopies: { gt: 0 } }),
    }));
  });

  it('issues a book to a faculty borrower when signature text is supplied', async () => {
    mocks.prisma.teacherProfile.findUnique.mockResolvedValue({ userId: teacherUser.id });
    mocks.prisma.user.findUnique.mockResolvedValue(teacherUser);
    mocks.prisma.book.findUnique.mockResolvedValue(activeBook);
    mocks.prisma.loan.count.mockResolvedValue(0);
    mocks.prisma.loan.findFirst.mockResolvedValue(null);
    mocks.prisma.book.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.loan.create.mockResolvedValue({
      id: 'loan-2',
      bookId: activeBook.id,
      userId: teacherUser.id,
      borrowerRole: Role.TEACHER,
      facultySignatureText: 'Teacher One',
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 86400000),
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      book: activeBook,
      user: teacherUser,
    });

    const result = await loanService.issueLoan({
      accessionNumber: activeBook.accessionNumber,
      teacherId: 'T-1',
      facultySignatureText: 'Teacher One',
      issuedById: 'admin-1',
    });

    expect(result.borrowerRole).toBe(Role.TEACHER);
    expect(mocks.prisma.loan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ facultySignatureText: 'Teacher One' }),
    }));
  });

  it('rejects archived books', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(studentUser);
    mocks.prisma.book.findUnique.mockResolvedValue({ ...activeBook, isArchived: true });
    mocks.prisma.loan.count.mockResolvedValue(0);

    await expect(loanService.issueLoan({
      accessionNumber: activeBook.accessionNumber,
      userId: studentUser.id,
      issuedById: 'admin-1',
    })).rejects.toThrow('Book not found');
  });

  it('rejects unavailable or already-issued accession numbers', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(studentUser);
    mocks.prisma.book.findUnique.mockResolvedValue({ ...activeBook, availableCopies: 0 });
    mocks.prisma.loan.count.mockResolvedValue(0);

    await expect(loanService.issueLoan({
      accessionNumber: activeBook.accessionNumber,
      userId: studentUser.id,
      issuedById: 'admin-1',
    })).rejects.toThrow('Book is currently unavailable');
  });

  it('returns an active loan and increments availability once', async () => {
    mocks.prisma.loan.findUnique.mockResolvedValue({
      id: 'loan-1',
      bookId: activeBook.id,
      status: LoanStatus.ACTIVE,
      returnedAt: null,
      book: activeBook,
    });
    mocks.prisma.loan.updateMany.mockResolvedValue({ count: 1 });
    mocks.prisma.loan.findUniqueOrThrow.mockResolvedValue({
      id: 'loan-1',
      bookId: activeBook.id,
      userId: studentUser.id,
      issuedAt: new Date(Date.now() - 86400000),
      dueAt: new Date(Date.now() + 86400000),
      returnedAt: new Date(),
      status: LoanStatus.RETURNED,
      book: activeBook,
      user: studentUser,
    });
    mocks.prisma.book.update.mockResolvedValue(activeBook);

    const result = await loanService.returnLoan('loan-1', 'admin-1');

    expect(result.status).toBe(LoanStatus.RETURNED);
    expect(mocks.prisma.book.update).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate returns without incrementing availability', async () => {
    mocks.prisma.loan.findUnique.mockResolvedValue({
      id: 'loan-1',
      bookId: activeBook.id,
      status: LoanStatus.RETURNED,
      returnedAt: new Date(),
      book: activeBook,
    });

    await expect(loanService.returnLoan('loan-1', 'admin-1')).rejects.toThrow('Loan is already returned or not active');
    expect(mocks.prisma.book.update).not.toHaveBeenCalled();
  });

  it('lists active overdue loans with pagination metadata', async () => {
    mocks.prisma.loan.findMany.mockResolvedValue([{
      id: 'loan-overdue',
      bookId: activeBook.id,
      userId: studentUser.id,
      issuedAt: new Date(Date.now() - 3 * 86400000),
      dueAt: new Date(Date.now() - 86400000),
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      book: activeBook,
      user: studentUser,
    }]);
    mocks.prisma.loan.count.mockResolvedValue(1);

    const result = await loanService.listLoans({ overdue: true, page: 1, pageSize: 10 });

    expect(result.total).toBe(1);
    expect(result.items[0].effectiveStatus).toBe(LoanStatus.OVERDUE);
  });

  it('returns borrower history records with computed statuses', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({ id: studentUser.id });
    mocks.prisma.loan.findMany.mockResolvedValue([{
      id: 'loan-1',
      bookId: activeBook.id,
      userId: studentUser.id,
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 86400000),
      returnedAt: null,
      status: LoanStatus.ACTIVE,
      book: activeBook,
      user: studentUser,
    }]);

    const result = await loanService.listBorrowerHistory(studentUser.id);

    expect(result).toHaveLength(1);
    expect(result[0].effectiveStatus).toBe(LoanStatus.ACTIVE);
  });
});
