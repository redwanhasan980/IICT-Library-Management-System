import { LoanStatus } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import policyService from './policy.service';
import reservationService from './reservation.service';

interface IssueLoanInput {
  bookId: string;
  userId: string;
  issuedById: string;
  dueAt?: string;
}

class LoanService {
  async issueLoan(payload: IssueLoanInput) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError('Borrower not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Admin users cannot borrow books', 400);
    }

    const [book, activeLoansCount, maxActiveLoans, roleDurationDays] = await Promise.all([
      prisma.book.findUnique({ where: { id: payload.bookId } }),
      prisma.loan.count({
        where: {
          userId: payload.userId,
          status: LoanStatus.ACTIVE,
        },
      }),
      policyService.getMaxActiveLoansByRole(user.role),
      policyService.getBorrowDurationByRole(user.role),
    ]);

    if (!book || book.isArchived) {
      throw new AppError('Book not found', 404);
    }

    if (book.availableCopies < 1) {
      throw new AppError('Book is currently unavailable', 400);
    }

    if (activeLoansCount >= maxActiveLoans) {
      throw new AppError('Borrower has reached maximum active loan limit', 400);
    }

    const issueDate = new Date();
    const dueDate = payload.dueAt
      ? new Date(payload.dueAt)
      : new Date(issueDate.getTime() + roleDurationDays * 24 * 60 * 60 * 1000);

    const loan = await prisma.$transaction(async (tx) => {
      const created = await tx.loan.create({
        data: {
          bookId: payload.bookId,
          userId: payload.userId,
          issuedById: payload.issuedById,
          dueAt: dueDate,
          status: LoanStatus.ACTIVE,
        },
        include: {
          book: true,
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      await tx.book.update({
        where: { id: payload.bookId },
        data: {
          availableCopies: { decrement: 1 },
        },
      });

      return created;
    });

    logAuditEvent({
      action: 'loan.issue',
      actorId: payload.issuedById,
      entity: 'Loan',
      entityId: loan.id,
      details: { userId: payload.userId, bookId: payload.bookId, dueAt: dueDate.toISOString() },
    });

    return loan;
  }

  async returnLoan(loanId: string, adminId: string) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { book: true },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new AppError('Only active loans can be returned', 400);
    }

    const now = new Date();

    const updatedLoan = await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.RETURNED,
          returnedAt: now,
          returnedById: adminId,
        },
        include: {
          book: true,
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      await tx.book.update({
        where: { id: loan.bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      });

      return updated;
    });

    await reservationService.fulfillNextPendingReservation(loan.bookId, adminId);

    logAuditEvent({
      action: 'loan.return',
      actorId: adminId,
      entity: 'Loan',
      entityId: loanId,
      details: { bookId: loan.bookId },
    });

    return updatedLoan;
  }

  async listMyLoans(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async lookupBookAndActiveLoanByAccession(accessionNumber: string) {
    const book = await prisma.book.findUnique({
      where: { accessionNumber },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const activeLoan = await prisma.loan.findFirst({
      where: {
        bookId: book.id,
        status: LoanStatus.ACTIVE,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return {
      book,
      activeLoan,
    };
  }
}

export default new LoanService();
