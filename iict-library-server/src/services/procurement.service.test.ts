import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Department, ProcurementStatus, ShelvingStatus } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const prisma = {
    procurementApplication: {
      aggregate: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    bookRequisition: {
      aggregate: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vendor: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    procurement: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  return { prisma };
});

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('../utils/auditLog', () => ({ logAuditEvent: vi.fn() }));

const { default: procurementService } = await import('./procurement.service');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('procurementService', () => {
  it('creates a procurement application and rejects duplicate codes', async () => {
    mocks.prisma.procurementApplication.findUnique.mockResolvedValueOnce(null);
    mocks.prisma.procurementApplication.create.mockResolvedValue({
      id: 'app-1',
      applicationCode: 'APP-2026-01',
      budgetYear: 2026,
      allocatedBudget: 100000,
      department: Department.SWE,
      requisitions: [],
    });

    const created = await procurementService.createApplication('admin-1', {
      applicationCode: 'APP-2026-01',
      budgetYear: 2026,
      allocatedBudget: 100000,
      department: Department.SWE,
    });

    expect(created.applicationCode).toBe('APP-2026-01');

    mocks.prisma.procurementApplication.findUnique.mockResolvedValueOnce({ id: 'app-1' });
    await expect(procurementService.createApplication('admin-1', {
      applicationCode: 'APP-2026-01',
      budgetYear: 2026,
      allocatedBudget: 100000,
      department: Department.SWE,
    })).rejects.toThrow('already exists');
  });

  it('creates a requisition and calculates total price when omitted', async () => {
    mocks.prisma.procurementApplication.findUnique.mockResolvedValue({ id: 'app-1' });
    mocks.prisma.bookRequisition.findUnique.mockResolvedValue(null);
    mocks.prisma.bookRequisition.create.mockResolvedValue({
      id: 'req-1',
      requisitionCode: 'REQ-1',
      applicationId: 'app-1',
      bookTitle: 'Database Systems',
      authorName: 'Elmasri',
      quantity: 4,
      pricePerUnit: 250,
      totalPrice: 1000,
    });

    await procurementService.createRequisition('admin-1', {
      requisitionCode: 'REQ-1',
      applicationId: 'app-1',
      bookTitle: 'Database Systems',
      authorName: 'Elmasri',
      quantity: 4,
      pricePerUnit: 250,
    });

    expect(mocks.prisma.bookRequisition.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalPrice: 1000 }),
    }));
  });

  it('creates an order after validating requisition, vendor, and unique code', async () => {
    mocks.prisma.bookRequisition.findUnique.mockResolvedValue({ id: 'req-1' });
    mocks.prisma.vendor.findUnique.mockResolvedValue({ id: 'vendor-1' });
    mocks.prisma.procurement.findUnique.mockResolvedValue(null);
    mocks.prisma.procurement.create.mockResolvedValue({
      id: 'po-1',
      procurementCode: 'PO-1',
      requisitionId: 'req-1',
      vendorId: 'vendor-1',
      procurementStatus: ProcurementStatus.ONGOING,
      shelvingStatus: ShelvingStatus.PENDING,
    });

    const created = await procurementService.createProcurement('admin-1', {
      procurementCode: 'PO-1',
      requisitionId: 'req-1',
      vendorId: 'vendor-1',
      procurementApprovalDate: '2026-04-28',
      procurementStatus: ProcurementStatus.ONGOING,
      shelvingStatus: ShelvingStatus.PENDING,
    });

    expect(created.procurementCode).toBe('PO-1');
    expect(mocks.prisma.procurement.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        procurementApprovalDate: expect.any(Date),
        procurementStatus: ProcurementStatus.ONGOING,
      }),
    }));
  });

  it('lists procurement orders with status and search filters', async () => {
    mocks.prisma.procurement.findMany.mockResolvedValue([]);
    mocks.prisma.procurement.count.mockResolvedValue(0);

    const result = await procurementService.listProcurements({
      q: 'database',
      procurementStatus: ProcurementStatus.ONGOING,
      page: 1,
      pageSize: 10,
    });

    expect(result.total).toBe(0);
    expect(mocks.prisma.procurement.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        procurementStatus: ProcurementStatus.ONGOING,
        OR: expect.any(Array),
      }),
      take: 10,
    }));
  });

  it('returns procurement summary totals', async () => {
    mocks.prisma.procurementApplication.count.mockResolvedValue(2);
    mocks.prisma.bookRequisition.count.mockResolvedValue(3);
    mocks.prisma.vendor.count.mockResolvedValue(1);
    mocks.prisma.procurement.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    mocks.prisma.procurementApplication.aggregate.mockResolvedValue({ _sum: { allocatedBudget: 5000 } });
    mocks.prisma.bookRequisition.aggregate.mockResolvedValue({ _sum: { quantity: 12, totalPrice: 3000 } });

    const summary = await procurementService.getSummary();

    expect(summary.totalApplications).toBe(2);
    expect(summary.ongoingOrders).toBe(2);
    expect(summary.totalEstimatedCost).toBe(3000);
  });
});
