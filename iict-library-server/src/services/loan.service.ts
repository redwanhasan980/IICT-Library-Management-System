import { LoanStatus, Role } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import policyService from './policy.service';
import reservationService from './reservation.service';

interface IssueLoanInput {
  bookId?: string;
  accessionNumber?: string;
  userId?: string;
  studentRegNumber?: string;
  teacherId?: string;
  issuedById: string;
  dueAt?: string;
  facultySignatureText?: string;
}

interface ListLoansQuery {
  status?: LoanStatus;
  overdue?: boolean;
  borrowerRole?: Role;
  q?: string;
  page?: number;
  pageSize?: number;
}

class LoanService {
  private withComputedStatus<T extends { status: LoanStatus; dueAt: Date; returnedAt: Date | null }>(loan: T) {
    const isOverdue = loan.status === LoanStatus.ACTIVE && !loan.returnedAt && loan.dueAt.getTime() < Date.now();
    return {
      ...loan,
      isOverdue,
      effectiveStatus: isOverdue ? LoanStatus.OVERDUE : loan.status,
    };
  }

  private async findBorrower(payload: Pick<IssueLoanInput, 'userId' | 'studentRegNumber' | 'teacherId'>) {
    if (payload.userId) {
      return prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          student: { select: { id: true, department: true, studentRegNumber: true } },
          teacher: { select: { id: true, department: true, teacherId: true, signatureData: true } },
        },
      });
    }

    if (payload.studentRegNumber) {
      const profile = await prisma.studentProfile.findUnique({
        where: { studentRegNumber: payload.studentRegNumber },
        include: {
          user: true,
        },
      });

      if (!profile) {
        return null;
      }

      return prisma.user.findUnique({
        where: { id: profile.userId },
        include: {
          student: { select: { id: true, department: true, studentRegNumber: true } },
          teacher: { select: { id: true, department: true, teacherId: true, signatureData: true } },
        },
      });
    }

    if (payload.teacherId) {
      const profile = await prisma.teacherProfile.findUnique({
        where: { teacherId: payload.teacherId },
        include: {
          user: true,
        },
      });

      if (!profile) {
        return null;
      }

      return prisma.user.findUnique({
        where: { id: profile.userId },
        include: {
          student: { select: { id: true, department: true, studentRegNumber: true } },
          teacher: { select: { id: true, department: true, teacherId: true, signatureData: true } },
        },
      });
    }

    throw new AppError('Provide borrower userId, student registration number, or teacher ID', 400);
  }

  async issueLoan(payload: IssueLoanInput) {
    const user = await this.findBorrower(payload);

    if (!user) {
      throw new AppError('Borrower not found', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Admin users cannot borrow books', 400);
    }

    if (user.role === 'STUDENT') {
      if (!user.student) {
        throw new AppError('Student profile is required for borrowing', 400);
      }
      if (!user.student.department) {
        throw new AppError('Student department is required for borrowing', 400);
      }
    }

    if (user.role === 'TEACHER') {
      if (!user.teacher) {
        throw new AppError('Teacher profile is required for borrowing', 400);
      }
      if (!user.teacher.department) {
        throw new AppError('Teacher department is required for borrowing', 400);
      }
    }

    const bookLookup = payload.bookId
      ? { id: payload.bookId }
      : payload.accessionNumber
        ? { accessionNumber: payload.accessionNumber }
        : null;

    if (!bookLookup) {
      throw new AppError('Book ID or accession number is required', 400);
    }

    const [book, activeLoansCount, maxActiveLoans, roleDurationDays] = await Promise.all([
      prisma.book.findUnique({ where: bookLookup }),
      prisma.loan.count({
        where: {
          userId: user.id,
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

    const activeBookLoan = await prisma.loan.findFirst({
      where: {
        bookId: book.id,
        status: LoanStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (activeBookLoan) {
      throw new AppError('This accession number is already issued', 409);
    }

    if (activeLoansCount >= maxActiveLoans) {
      throw new AppError('Borrower has reached maximum active loan limit', 400);
    }

    const issueDate = new Date();
    const dueDate = payload.dueAt
      ? new Date(payload.dueAt)
      : new Date(issueDate.getTime() + roleDurationDays * 24 * 60 * 60 * 1000);

    const facultySignatureText =
      user.role === 'TEACHER' ? payload.facultySignatureText ?? user.teacher?.signatureData ?? undefined : undefined;

    if (user.role === 'TEACHER' && !facultySignatureText) {
      throw new AppError('Faculty borrowing requires signature information', 400);
    }

    if (dueDate <= issueDate) {
      throw new AppError('Due date must be after issue date', 400);
    }

    const loan = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.book.updateMany({
        where: {
          id: book.id,
          isArchived: false,
          availableCopies: { gt: 0 },
        },
        data: {
          availableCopies: { decrement: 1 },
        },
      });

      if (updateResult.count !== 1) {
        throw new AppError('Book is currently unavailable', 409);
      }

      const activeLoanInTx = await tx.loan.findFirst({
        where: {
          bookId: book.id,
          status: LoanStatus.ACTIVE,
        },
        select: { id: true },
      });

      if (activeLoanInTx) {
        throw new AppError('This accession number is already issued', 409);
      }

      const created = await tx.loan.create({
        data: {
          bookId: book.id,
          userId: user.id,
          borrowerRole: user.role,
          facultySignatureText,
          facultySignatureRecordedAt: facultySignatureText ? issueDate : undefined,
          issuedById: payload.issuedById,
          dueAt: dueDate,
          status: LoanStatus.ACTIVE,
        },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
              teacher: { select: { teacherId: true, department: true, designation: true } },
            },
          },
        },
      });

      return created;
    });

    logAuditEvent({
      action: 'loan.issue',
      actorId: payload.issuedById,
      entity: 'Loan',
      entityId: loan.id,
      details: { userId: user.id, bookId: book.id, dueAt: dueDate.toISOString() },
    });

    return this.withComputedStatus(loan);
  }

  async returnLoan(loanId: string, adminId: string) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { book: true },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status !== LoanStatus.ACTIVE || loan.returnedAt) {
      throw new AppError('Loan is already returned or not active', 409);
    }

    const now = new Date();

    const updatedLoan = await prisma.$transaction(async (tx) => {
      const markedReturned = await tx.loan.updateMany({
        where: {
          id: loanId,
          status: LoanStatus.ACTIVE,
          returnedAt: null,
        },
        data: {
          status: LoanStatus.RETURNED,
          returnedAt: now,
          returnedById: adminId,
        },
      });

      if (markedReturned.count !== 1) {
        throw new AppError('Loan is already returned or not active', 409);
      }

      const updated = await tx.loan.findUniqueOrThrow({
        where: { id: loanId },
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
              teacher: { select: { teacherId: true, department: true, designation: true } },
            },
          },
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

    return this.withComputedStatus(updatedLoan);
  }

  async getLoanById(loanId: string, actor: { id: string; role: Role }) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
            teacher: { select: { teacherId: true, department: true, designation: true } },
          },
        },
        issuedBy: { select: { id: true, name: true, email: true, role: true } },
        returnedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (actor.role !== Role.ADMIN && loan.userId !== actor.id) {
      throw new AppError('Forbidden', 403);
    }

    return this.withComputedStatus(loan);
  }

  async listLoans(query: ListLoansQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;
    const now = new Date();

    const where = {
      status: query.status,
      borrowerRole: query.borrowerRole,
      dueAt: query.overdue ? { lt: now } : undefined,
      returnedAt: query.overdue ? null : undefined,
      OR: query.q
        ? [
            { book: { title: { contains: query.q } } },
            { book: { author: { contains: query.q } } },
            { book: { accessionNumber: { contains: query.q } } },
            { user: { name: { contains: query.q } } },
            { user: { email: { contains: query.q } } },
            { user: { student: { studentRegNumber: { contains: query.q } } } },
            { user: { teacher: { teacherId: { contains: query.q } } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          book: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
              teacher: { select: { teacherId: true, department: true, designation: true } },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);

    return {
      items: items.map((loan) => this.withComputedStatus(loan)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async listMyLoans(userId: string) {
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
            teacher: { select: { teacherId: true, department: true, designation: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return loans.map((loan) => this.withComputedStatus(loan));
  }

  async listBorrowerHistory(userId: string) {
    const borrower = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    return this.listMyLoans(userId);
  }

  async listBookHistory(bookId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } });
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const loans = await prisma.loan.findMany({
      where: { bookId },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
            teacher: { select: { teacherId: true, department: true, designation: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return loans.map((loan) => this.withComputedStatus(loan));
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            student: { select: { studentRegNumber: true, department: true, currentSemester: true } },
            teacher: { select: { teacherId: true, department: true, designation: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return {
      book,
      activeLoan: activeLoan ? this.withComputedStatus(activeLoan) : undefined,
    };
  }
}

export default new LoanService();
