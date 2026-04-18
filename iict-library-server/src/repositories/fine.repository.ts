import { LoanStatus } from '@prisma/client';
import prisma from '../config/database';

class FineRepository {
  async getFinePerDay() {
    const settings = await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
      select: { finePerDay: true },
    });
    return Number(settings.finePerDay);
  }

  async findLoanById(loanId: string) {
    return prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        finePayments: {
          orderBy: { paymentDate: 'asc' },
          include: {
            recordedBy: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  async findLoansByUser(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        finePayments: {
          orderBy: { paymentDate: 'asc' },
          include: {
            recordedBy: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async listPotentialFineLoans(query: { q?: string; role?: 'STUDENT' | 'TEACHER' }) {
    return prisma.loan.findMany({
      where: {
        user: {
          role: query.role,
          OR: query.q
            ? [
                { id: { contains: query.q } },
                { name: { contains: query.q } },
                { email: { contains: query.q } },
              ]
            : undefined,
        },
        OR: [
          { status: LoanStatus.ACTIVE },
          { status: LoanStatus.RETURNED },
          { status: LoanStatus.OVERDUE },
        ],
      },
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        finePayments: {
          orderBy: { paymentDate: 'asc' },
          include: {
            recordedBy: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  async createFinePayment(payload: {
    loanId: string;
    userId: string;
    recordedById: string;
    amount: number;
    paymentDate: Date;
    note?: string;
  }) {
    return prisma.finePayment.create({
      data: {
        loanId: payload.loanId,
        userId: payload.userId,
        recordedById: payload.recordedById,
        amount: payload.amount,
        paymentDate: payload.paymentDate,
        note: payload.note,
      },
      include: {
        loan: { include: { book: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        recordedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async listPaymentHistory(query: { userId?: string; loanId?: string }) {
    return prisma.finePayment.findMany({
      where: {
        userId: query.userId,
        loanId: query.loanId,
      },
      include: {
        loan: { include: { book: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        recordedBy: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}

export default new FineRepository();
