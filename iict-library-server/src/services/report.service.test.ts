import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoanStatus, ProcurementStatus, Role, ShelvingStatus } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    loan: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    book: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    procurement: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    outsideBookEntry: {
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

  it('returns catalog inventory report summary from real book fields', async () => {
    mocks.prisma.book.findMany
      .mockResolvedValueOnce([{
        id: 'book-1',
        accessionNumber: 'ACC-1',
        title: 'Database Systems',
        author: 'Elmasri',
        department: 'SWE',
        callNumber: '005.74 ELM',
        barcode: 'BC-1',
        totalCopies: 2,
        availableCopies: 1,
        isArchived: false,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
      }])
      .mockResolvedValueOnce([{
        id: 'book-1',
        totalCopies: 2,
        availableCopies: 1,
        isArchived: false,
      }]);
    mocks.prisma.book.count.mockResolvedValue(1);

    const report = await reportService.getCatalogInventoryReport({ q: 'Database', page: 1, pageSize: 10 });

    expect(report.summary.totalCopies).toBe(2);
    expect(report.summary.availableCopies).toBe(1);
    expect(report.summary.issuedOrUnavailableCopies).toBe(1);
    expect(report.items[0].accessionNumber).toBe('ACC-1');
  });

  it('returns procurement summary report totals', async () => {
    const procurementRow = {
      id: 'proc-1',
      procurementCode: 'PROC-1',
      procurementStatus: ProcurementStatus.COMPLETED,
      shelvingStatus: ShelvingStatus.SHELVED,
      procurementApprovalDate: new Date('2026-04-01T00:00:00.000Z'),
      deliveryDate: new Date('2026-04-10T00:00:00.000Z'),
      handoverDateToIICT: new Date('2026-04-12T00:00:00.000Z'),
      requisition: {
        requisitionCode: 'REQ-1',
        bookTitle: 'Database Systems',
        authorName: 'Elmasri',
        totalPrice: 5000,
        application: { department: 'SWE' },
      },
      vendor: { vendorName: 'Vendor One' },
      _count: { books: 3 },
    };

    mocks.prisma.procurement.findMany
      .mockResolvedValueOnce([procurementRow])
      .mockResolvedValueOnce([procurementRow]);
    mocks.prisma.procurement.count.mockResolvedValue(1);

    const report = await reportService.getProcurementSummaryReport({ procurementStatus: ProcurementStatus.COMPLETED });

    expect(report.summary.completedOrders).toBe(1);
    expect(report.summary.catalogedBooks).toBe(3);
    expect(report.summary.estimatedValue).toBe(5000);
    expect(report.items[0].vendorName).toBe('Vendor One');
  });
});
