import {
  Department,
  LoanStatus,
  OutsideBookEntryStatus,
  Prisma,
  ProcurementStatus,
  Role,
  ShelvingStatus,
} from '@prisma/client';
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

interface OutsideBooksReportQuery {
  from?: string;
  to?: string;
  status?: OutsideBookEntryStatus | 'ALL';
  department?: Department;
  q?: string;
  page?: number;
  pageSize?: number;
}

interface CatalogInventoryReportQuery {
  q?: string;
  department?: Department;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

interface ProcurementReportQuery {
  q?: string;
  procurementStatus?: ProcurementStatus;
  shelvingStatus?: ShelvingStatus;
  page?: number;
  pageSize?: number;
}

interface AuditLogReportQuery {
  q?: string;
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
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

const decimalToNumber = (value: Prisma.Decimal | number | string | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value);

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

  async getReturnedBooksReport(query: Omit<IssuedBooksReportQuery, 'status'>) {
    return this.getIssuedBooksReport({ ...query, status: LoanStatus.RETURNED });
  }

  async getOverdueLoansReport(query: Omit<IssuedBooksReportQuery, 'status'>) {
    return this.getIssuedBooksReport({ ...query, status: LoanStatus.OVERDUE });
  }

  async getOutsideBooksReport(query: OutsideBooksReportQuery) {
    const { page, pageSize, skip } = normalizePagination(query.page, query.pageSize);
    const where: Prisma.OutsideBookEntryWhereInput = {
      entryTime: {
        gte: parseFrom(query.from),
        lte: parseTo(query.to),
      },
      entryStatus: query.status && query.status !== 'ALL' ? query.status : undefined,
      studentDepartmentSnapshot: query.department,
      OR: query.q
        ? [
            { title: { contains: query.q } },
            { author: { contains: query.q } },
            { studentRegNumberSnapshot: { contains: query.q } },
            { student: { user: { name: { contains: query.q } } } },
            { student: { user: { email: { contains: query.q } } } },
          ]
        : undefined,
    };

    const [items, total, summaryRows] = await Promise.all([
      prisma.outsideBookEntry.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: { include: { user: true } },
          verifiedByEntry: { include: { user: true } },
          verifiedByExit: { include: { user: true } },
        },
        orderBy: { entryTime: 'desc' },
      }),
      prisma.outsideBookEntry.count({ where }),
      prisma.outsideBookEntry.findMany({
        where,
        select: {
          id: true,
          studentId: true,
          entryStatus: true,
          isVerifiedEntry: true,
          isVerifiedExit: true,
        },
      }),
    ]);

    return {
      filters: {
        from: parseFrom(query.from)?.toISOString(),
        to: parseTo(query.to)?.toISOString(),
        status: query.status ?? 'ALL',
        department: query.department,
        q: query.q,
      },
      summary: {
        totalEntries: summaryRows.length,
        activeEntries: summaryRows.filter((row) => row.entryStatus === OutsideBookEntryStatus.ENTERED).length,
        exitedEntries: summaryRows.filter((row) => row.entryStatus === OutsideBookEntryStatus.EXITED).length,
        verifiedEntries: summaryRows.filter((row) => row.isVerifiedEntry).length,
        verifiedExits: summaryRows.filter((row) => row.isVerifiedExit).length,
        uniqueStudents: new Set(summaryRows.map((row) => row.studentId)).size,
      },
      items: items.map((entry) => ({
        id: entry.id,
        title: entry.title,
        author: entry.author,
        studentName: entry.student.user.name,
        studentEmail: entry.student.user.email,
        studentRegNumber: entry.studentRegNumberSnapshot ?? entry.student.studentRegNumber,
        department: entry.studentDepartmentSnapshot ?? entry.student.department,
        semester: entry.studentSemesterSnapshot ?? entry.student.currentSemester,
        entryStatus: entry.entryStatus,
        entryTime: entry.entryTime.toISOString(),
        exitTime: entry.exitTime?.toISOString(),
        isVerifiedEntry: entry.isVerifiedEntry,
        isVerifiedExit: entry.isVerifiedExit,
        verifiedByEntry: entry.verifiedByEntry?.user
          ? { id: entry.verifiedByEntry.user.id, name: entry.verifiedByEntry.user.name, email: entry.verifiedByEntry.user.email }
          : undefined,
        verifiedByExit: entry.verifiedByExit?.user
          ? { id: entry.verifiedByExit.user.id, name: entry.verifiedByExit.user.name, email: entry.verifiedByExit.user.email }
          : undefined,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getCatalogInventoryReport(query: CatalogInventoryReportQuery) {
    const { page, pageSize, skip } = normalizePagination(query.page, query.pageSize);
    const where: Prisma.BookWhereInput = {
      isArchived: query.includeArchived ? undefined : false,
      department: query.department,
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

    const [items, total, summaryRows] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        select: {
          id: true,
          totalCopies: true,
          availableCopies: true,
          isArchived: true,
        },
      }),
    ]);

    return {
      filters: {
        q: query.q,
        department: query.department,
        includeArchived: Boolean(query.includeArchived),
      },
      summary: {
        totalRecords: summaryRows.length,
        totalCopies: summaryRows.reduce((sum, book) => sum + book.totalCopies, 0),
        availableCopies: summaryRows.reduce((sum, book) => sum + book.availableCopies, 0),
        issuedOrUnavailableCopies: summaryRows.reduce((sum, book) => sum + Math.max(book.totalCopies - book.availableCopies, 0), 0),
        archivedRecords: summaryRows.filter((book) => book.isArchived).length,
      },
      items: items.map((book) => ({
        id: book.id,
        accessionNumber: book.accessionNumber,
        title: book.title,
        author: book.author,
        department: book.department,
        callNumber: book.callNumber,
        barcode: book.barcode,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        isArchived: book.isArchived,
        createdAt: book.createdAt.toISOString(),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getProcurementSummaryReport(query: ProcurementReportQuery) {
    const { page, pageSize, skip } = normalizePagination(query.page, query.pageSize);
    const where: Prisma.ProcurementWhereInput = {
      procurementStatus: query.procurementStatus,
      shelvingStatus: query.shelvingStatus,
      OR: query.q
        ? [
            { procurementCode: { contains: query.q } },
            { bookReceivingRecord: { contains: query.q } },
            { requisition: { requisitionCode: { contains: query.q } } },
            { requisition: { bookTitle: { contains: query.q } } },
            { vendor: { vendorName: { contains: query.q } } },
          ]
        : undefined,
    };

    const include = {
      requisition: {
        include: {
          application: true,
        },
      },
      vendor: true,
      _count: { select: { books: true } },
    };

    const [items, total, summaryRows] = await Promise.all([
      prisma.procurement.findMany({
        where,
        skip,
        take: pageSize,
        include,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.procurement.count({ where }),
      prisma.procurement.findMany({
        where,
        include,
      }),
    ]);

    const summarizeByStatus = (status: ProcurementStatus) =>
      summaryRows.filter((row) => row.procurementStatus === status).length;

    return {
      filters: {
        q: query.q,
        procurementStatus: query.procurementStatus,
        shelvingStatus: query.shelvingStatus,
      },
      summary: {
        totalOrders: summaryRows.length,
        notStartedOrders: summarizeByStatus(ProcurementStatus.NOT_STARTED),
        ongoingOrders: summarizeByStatus(ProcurementStatus.ONGOING),
        completedOrders: summarizeByStatus(ProcurementStatus.COMPLETED),
        cancelledOrders: summarizeByStatus(ProcurementStatus.CANCELLED),
        catalogedBooks: summaryRows.reduce((sum, row) => sum + row._count.books, 0),
        estimatedValue: summaryRows.reduce((sum, row) => sum + decimalToNumber(row.requisition.totalPrice), 0),
      },
      items: items.map((item) => ({
        id: item.id,
        procurementCode: item.procurementCode,
        requisitionCode: item.requisition.requisitionCode,
        bookTitle: item.requisition.bookTitle,
        authorName: item.requisition.authorName,
        vendorName: item.vendor.vendorName,
        department: item.requisition.application.department,
        procurementStatus: item.procurementStatus,
        shelvingStatus: item.shelvingStatus,
        approvalDate: item.procurementApprovalDate?.toISOString(),
        deliveryDate: item.deliveryDate?.toISOString(),
        handoverDateToIICT: item.handoverDateToIICT?.toISOString(),
        catalogedBooks: item._count.books,
        estimatedValue: decimalToNumber(item.requisition.totalPrice),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getAuditLogReport(query: AuditLogReportQuery) {
    const { page, pageSize, skip } = normalizePagination(query.page, query.pageSize);
    const where: Prisma.AuditLogWhereInput = {
      actorId: query.actorId,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      createdAt: query.from || query.to
        ? {
            gte: parseFrom(query.from),
            lte: parseTo(query.to),
          }
        : undefined,
      OR: query.q
        ? [
            { action: { contains: query.q } },
            { actorId: { contains: query.q } },
            { entityType: { contains: query.q } },
            { entityId: { contains: query.q } },
          ]
        : undefined,
    };

    const [items, total, summaryRows] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          actorId: true,
        },
      }),
    ]);

    return {
      filters: query,
      summary: {
        totalEvents: summaryRows.length,
        uniqueActors: new Set(summaryRows.map((row) => row.actorId).filter(Boolean)).size,
        uniqueActions: new Set(summaryRows.map((row) => row.action)).size,
      },
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export default new ReportService();
