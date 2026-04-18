import { Role } from '@prisma/client';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import FineRepository from '../repositories/fine.repository';

const DAY_MS = 24 * 60 * 60 * 1000;

const round2 = (value: number) => Math.round(value * 100) / 100;

class FineService {
  private overdueDays(dueAt: Date, returnedAt: Date | null, now: Date) {
    const effectiveEnd = returnedAt ?? now;
    if (effectiveEnd <= dueAt) {
      return 0;
    }

    const diff = effectiveEnd.getTime() - dueAt.getTime();
    return Math.ceil(diff / DAY_MS);
  }

  private summarizeLoanFine(loan: Awaited<ReturnType<typeof FineRepository.findLoanById>> extends infer T
    ? T extends null
      ? never
      : T
    : never, finePerDay: number, now: Date) {
    const overdueDays = this.overdueDays(loan.dueAt, loan.returnedAt, now);
    const calculatedFine = round2(overdueDays * finePerDay);
    const paidAmount = round2(loan.finePayments.reduce((sum, payment) => sum + Number(payment.amount), 0));
    const outstanding = round2(Math.max(calculatedFine - paidAmount, 0));

    const paymentStatus = outstanding <= 0
      ? 'PAID'
      : paidAmount > 0
        ? 'PARTIALLY_PAID'
        : 'UNPAID';

    return {
      loanId: loan.id,
      borrower: loan.user,
      book: loan.book,
      issuedAt: loan.issuedAt,
      dueAt: loan.dueAt,
      returnedAt: loan.returnedAt,
      loanStatus: loan.status,
      overdueDays,
      finePerDay,
      calculatedFine,
      paidAmount,
      outstanding,
      paymentStatus,
      payments: loan.finePayments,
    };
  }

  async getFineSummaryForUser(userId: string) {
    const [finePerDay, loans] = await Promise.all([
      FineRepository.getFinePerDay(),
      FineRepository.findLoansByUser(userId),
    ]);

    const now = new Date();
    const transactionSummaries = loans.map((loan) => this.summarizeLoanFine(loan, finePerDay, now));

    const totalCalculatedFine = round2(transactionSummaries.reduce((sum, item) => sum + item.calculatedFine, 0));
    const totalPaid = round2(transactionSummaries.reduce((sum, item) => sum + item.paidAmount, 0));
    const totalOutstanding = round2(transactionSummaries.reduce((sum, item) => sum + item.outstanding, 0));

    return {
      userId,
      finePerDay,
      totalCalculatedFine,
      totalPaid,
      totalOutstanding,
      transactions: transactionSummaries,
    };
  }

  async getFineDetailsForTransaction(loanId: string, actor: { id: string; role: Role }) {
    const [finePerDay, loan] = await Promise.all([
      FineRepository.getFinePerDay(),
      FineRepository.findLoanById(loanId),
    ]);

    if (!loan) {
      throw new AppError('Loan transaction not found', 404);
    }

    if (actor.role !== 'ADMIN' && loan.userId !== actor.id) {
      throw new AppError('Forbidden', 403);
    }

    return this.summarizeLoanFine(loan, finePerDay, new Date());
  }

  async listUnpaidOrPartialFines(query: { q?: string; role?: 'STUDENT' | 'TEACHER' }) {
    const [finePerDay, loans] = await Promise.all([
      FineRepository.getFinePerDay(),
      FineRepository.listPotentialFineLoans(query),
    ]);

    const now = new Date();

    const rows = loans
      .map((loan) => this.summarizeLoanFine(loan, finePerDay, now))
      .filter((item) => item.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);

    return rows;
  }

  async recordFinePayment(actorId: string, payload: {
    loanId: string;
    amount: number;
    paymentDate?: string;
    note?: string;
  }) {
    const [finePerDay, loan] = await Promise.all([
      FineRepository.getFinePerDay(),
      FineRepository.findLoanById(payload.loanId),
    ]);

    if (!loan) {
      throw new AppError('Loan transaction not found', 404);
    }

    const summary = this.summarizeLoanFine(loan, finePerDay, new Date());

    if (summary.outstanding <= 0) {
      throw new AppError('No outstanding fine for this transaction', 400);
    }

    const amount = round2(payload.amount);
    if (amount > summary.outstanding) {
      throw new AppError('Payment amount cannot exceed outstanding fine', 400);
    }

    const paymentDate = payload.paymentDate ? new Date(payload.paymentDate) : new Date();

    const payment = await FineRepository.createFinePayment({
      loanId: loan.id,
      userId: loan.userId,
      recordedById: actorId,
      amount,
      paymentDate,
      note: payload.note,
    });

    logAuditEvent({
      action: 'fine.payment_recorded',
      actorId,
      entity: 'FinePayment',
      entityId: payment.id,
      details: {
        loanId: loan.id,
        userId: loan.userId,
        amount,
      },
    });

    return {
      payment,
      updatedTransaction: await this.getFineDetailsForTransaction(loan.id, { id: actorId, role: 'ADMIN' as Role }),
    };
  }

  async getPaymentHistory(query: { userId?: string; loanId?: string }, actor: { id: string; role: Role }) {
    if (actor.role !== 'ADMIN') {
      if (query.userId && query.userId !== actor.id) {
        throw new AppError('Forbidden', 403);
      }
      const safeQuery = { ...query, userId: actor.id };
      return FineRepository.listPaymentHistory(safeQuery);
    }

    return FineRepository.listPaymentHistory(query);
  }
}

export default new FineService();
