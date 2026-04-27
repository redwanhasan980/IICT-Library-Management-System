import { LoanStatus, Prisma, Role } from '@prisma/client';
import prisma from '../config/database';

interface IssuedBooksReportQuery {
  from?: string;
  to?: string;
  status?: LoanStatus | 'ALL';
  borrowerRole?: Role;
  q?: string;
  page?: number;
  pageSize?: number;
}

const reportLoanInclude = {
  book: true,
  user: {
    include: {
      student: true,
      teacher: true,
    },
  },
  issuedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  returnedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const normalizePagination = (page?: number, pageSize?: number) => {
  const safePage = page && page > 0 ? page : 1;
  const safePageSize = pageSize && pageSize > 0 ? Math.min(pageSize, 100) : 25;

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
  };
};

const parseFrom = (value?: string) => (value ? new Date(value) : undefined);

const parseTo = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    parsed.setHours(23, 59, 59, 999);
  }
  return parsed;
};

const isOverdue = (loan: { status: LoanStatus; dueAt: Date; returnedAt: Date | null }) =>
  loan.status === LoanStatus.ACTIVE && !loan.returnedAt && loan.dueAt.getTime() < Date.now();

const effectiveStatus = (loan: { status: LoanStatus; dueAt: Date; returnedAt: Date | null }) =>
  isOverdue(loan) ? LoanStatus.OVERDUE : loan.status;

const overdueDays = (loan: { dueAt: Date; returnedAt: Date | null }) => {
  const end = loan.returnedAt ?? new Date();
  if (end.getTime() <= loan.dueAt.getTime()) {
    return 0;
  }

  return Math.ceil((end.getTime() - loan.dueAt.getTime()) / (1000 * 60 * 60 * 24));
};

class ReportService {
  async getIssuedBooksReport(query: IssuedBooksReportQuery) {
    const { page, pageSize, skip } = normalizePagination(query.page, query.pageSize);
    const now = new Date();

    const where: Prisma.LoanWhereInput = {
      issuedAt: {
        gte: parseFrom(query.from),
        lte: parseTo(query.to),
      },
      borrowerRole: query.borrowerRole,
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

    if (query.status && query.status !== 'ALL') {
      if (query.status === LoanStatus.OVERDUE) {
        where.status = LoanStatus.ACTIVE;
        where.returnedAt = null;
        where.dueAt = { lt: now };
      } else {
        where.status = query.status;
      }
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: reportLoanInclude,
        skip,
        take: pageSize,
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);

    const summaryRows = await prisma.loan.findMany({
      where,
      select: {
        id: true,
        userId: true,
        status: true,
        dueAt: true,
        returnedAt: true,
      },
    });

    const activeCount = summaryRows.filter((loan) => effectiveStatus(loan) === LoanStatus.ACTIVE).length;
    const overdueCount = summaryRows.filter((loan) => effectiveStatus(loan) === LoanStatus.OVERDUE).length;
    const returnedCount = summaryRows.filter((loan) => loan.status === LoanStatus.RETURNED).length;

    return {
      filters: {
        from: parseFrom(query.from)?.toISOString(),
        to: parseTo(query.to)?.toISOString(),
        status: query.status ?? 'ALL',
        borrowerRole: query.borrowerRole,
        q: query.q,
      },
      summary: {
        totalIssued: summaryRows.length,
        activeCount,
        returnedCount,
        overdueCount,
        uniqueBorrowers: new Set(summaryRows.map((loan) => loan.userId)).size,
      },
      items: loans.map((loan) => ({
        id: loan.id,
        accessionNumber: loan.book.accessionNumber,
        bookTitle: loan.book.title,
        author: loan.book.author,
        borrowerName: loan.user.name,
        borrowerEmail: loan.user.email,
        borrowerRole: loan.borrowerRole ?? loan.user.role,
        borrowerIdentifier:
          loan.user.student?.studentRegNumber ??
          loan.user.teacher?.teacherId ??
          loan.user.email,
        department:
          loan.user.student?.department ??
          loan.user.teacher?.department ??
          loan.book.department ??
          null,
        issuedAt: loan.issuedAt.toISOString(),
        dueAt: loan.dueAt.toISOString(),
        returnedAt: loan.returnedAt?.toISOString(),
        status: loan.status,
        effectiveStatus: effectiveStatus(loan),
        overdueDays: overdueDays(loan),
        issuedBy: loan.issuedBy,
        returnedBy: loan.returnedBy,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export default new ReportService();
