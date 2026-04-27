import { Department, Prisma, ProcurementStatus, ShelvingStatus } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

interface PaginationQuery {
  q?: string;
  page?: number;
  pageSize?: number;
}

interface ListApplicationsQuery extends PaginationQuery {
  budgetYear?: number;
  department?: Department;
}

interface ApplicationInput {
  applicationCode: string;
  budgetYear: number;
  allocatedBudget: number;
  department: Department;
}

interface ListRequisitionsQuery extends PaginationQuery {
  applicationId?: string;
}

interface RequisitionInput {
  requisitionCode: string;
  applicationId: string;
  bookTitle: string;
  authorName: string;
  publisher?: string;
  edition?: string;
  isbn?: string;
  quantity: number;
  pricePerUnit?: number;
  totalPrice?: number;
}

interface VendorInput {
  vendorCode: string;
  vendorName: string;
  quotationDetails?: string;
}

interface ListProcurementsQuery extends PaginationQuery {
  requisitionId?: string;
  vendorId?: string;
  procurementStatus?: ProcurementStatus;
  shelvingStatus?: ShelvingStatus;
}

interface ProcurementInput {
  procurementCode: string;
  requisitionId: string;
  vendorId: string;
  procurementApprovalDate?: string;
  deliveryDate?: string;
  handoverDateToIICT?: string;
  bookReceivingRecord?: string;
  shelvingStatus?: ShelvingStatus;
  procurementStatus?: ProcurementStatus;
}

const pageMeta = (page?: number, pageSize?: number) => {
  const safePage = page && page > 0 ? page : 1;
  const safePageSize = pageSize && pageSize > 0 ? Math.min(pageSize, 100) : 20;
  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
  };
};

const decimalToNumber = (value: Prisma.Decimal | number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return value.toNumber();
};

const calculateTotalPrice = (quantity: number, pricePerUnit?: number) => {
  if (pricePerUnit === undefined) {
    return undefined;
  }

  return Number((quantity * pricePerUnit).toFixed(2));
};

const parseDate = (value?: string) => (value ? new Date(value) : undefined);

const applicationInclude = {
  requisitions: {
    select: {
      id: true,
      requisitionCode: true,
      bookTitle: true,
      authorName: true,
      quantity: true,
      totalPrice: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

const requisitionInclude = {
  application: {
    select: {
      id: true,
      applicationCode: true,
      budgetYear: true,
      department: true,
    },
  },
  procurements: {
    select: {
      id: true,
      procurementCode: true,
      procurementStatus: true,
      shelvingStatus: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

const procurementInclude = {
  requisition: {
    include: {
      application: {
        select: {
          id: true,
          applicationCode: true,
          budgetYear: true,
          department: true,
        },
      },
    },
  },
  vendor: true,
  books: {
    select: {
      id: true,
      title: true,
      accessionNumber: true,
      isArchived: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

class ProcurementService {
  async getSummary() {
    const [
      totalApplications,
      totalRequisitions,
      totalVendors,
      totalOrders,
      ongoingOrders,
      completedOrders,
      applicationBudget,
      requisitionTotals,
    ] = await Promise.all([
      prisma.procurementApplication.count(),
      prisma.bookRequisition.count(),
      prisma.vendor.count(),
      prisma.procurement.count(),
      prisma.procurement.count({ where: { procurementStatus: ProcurementStatus.ONGOING } }),
      prisma.procurement.count({ where: { procurementStatus: ProcurementStatus.COMPLETED } }),
      prisma.procurementApplication.aggregate({ _sum: { allocatedBudget: true } }),
      prisma.bookRequisition.aggregate({ _sum: { quantity: true, totalPrice: true } }),
    ]);

    return {
      totalApplications,
      totalRequisitions,
      totalVendors,
      totalOrders,
      ongoingOrders,
      completedOrders,
      totalAllocatedBudget: decimalToNumber(applicationBudget._sum.allocatedBudget) ?? 0,
      totalRequestedQuantity: requisitionTotals._sum.quantity ?? 0,
      totalEstimatedCost: decimalToNumber(requisitionTotals._sum.totalPrice) ?? 0,
    };
  }

  async listApplications(query: ListApplicationsQuery) {
    const { page, pageSize, skip } = pageMeta(query.page, query.pageSize);
    const numericQ = query.q && Number.isInteger(Number(query.q)) ? Number(query.q) : undefined;
    const searchFilters: Prisma.ProcurementApplicationWhereInput[] = query.q
      ? [
          { applicationCode: { contains: query.q } },
          { requisitions: { some: { bookTitle: { contains: query.q } } } },
          { requisitions: { some: { authorName: { contains: query.q } } } },
        ]
      : [];
    if (numericQ !== undefined) {
      searchFilters.push({ budgetYear: numericQ });
    }

    const where: Prisma.ProcurementApplicationWhereInput = {
      budgetYear: query.budgetYear,
      department: query.department,
      OR: searchFilters.length > 0 ? searchFilters : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.procurementApplication.findMany({
        where,
        include: applicationInclude,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.procurementApplication.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async createApplication(actorId: string, payload: ApplicationInput) {
    const exists = await prisma.procurementApplication.findUnique({
      where: { applicationCode: payload.applicationCode },
      select: { id: true },
    });

    if (exists) {
      throw new AppError('A procurement application already exists with this code', 409);
    }

    const created = await prisma.procurementApplication.create({
      data: payload,
      include: applicationInclude,
    });

    logAuditEvent({
      action: 'procurement.application.create',
      actorId,
      entity: 'ProcurementApplication',
      entityId: created.id,
      details: { applicationCode: created.applicationCode },
    });

    return created;
  }

  async updateApplication(actorId: string, id: string, payload: Partial<ApplicationInput>) {
    const current = await prisma.procurementApplication.findUnique({ where: { id } });
    if (!current) {
      throw new AppError('Procurement application not found', 404);
    }

    if (payload.applicationCode && payload.applicationCode !== current.applicationCode) {
      const exists = await prisma.procurementApplication.findUnique({
        where: { applicationCode: payload.applicationCode },
        select: { id: true },
      });
      if (exists) {
        throw new AppError('Another procurement application already uses this code', 409);
      }
    }

    const updated = await prisma.procurementApplication.update({
      where: { id },
      data: payload,
      include: applicationInclude,
    });

    logAuditEvent({
      action: 'procurement.application.update',
      actorId,
      entity: 'ProcurementApplication',
      entityId: id,
    });

    return updated;
  }

  async listRequisitions(query: ListRequisitionsQuery) {
    const { page, pageSize, skip } = pageMeta(query.page, query.pageSize);
    const where: Prisma.BookRequisitionWhereInput = {
      applicationId: query.applicationId,
      OR: query.q
        ? [
            { requisitionCode: { contains: query.q } },
            { bookTitle: { contains: query.q } },
            { authorName: { contains: query.q } },
            { publisher: { contains: query.q } },
            { isbn: { contains: query.q } },
            { application: { applicationCode: { contains: query.q } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.bookRequisition.findMany({
        where,
        include: requisitionInclude,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookRequisition.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async createRequisition(actorId: string, payload: RequisitionInput) {
    await this.ensureApplicationExists(payload.applicationId);
    await this.ensureRequisitionCodeAvailable(payload.requisitionCode);

    const totalPrice = payload.totalPrice ?? calculateTotalPrice(payload.quantity, payload.pricePerUnit);
    const created = await prisma.bookRequisition.create({
      data: {
        ...payload,
        totalPrice,
      },
      include: requisitionInclude,
    });

    logAuditEvent({
      action: 'procurement.requisition.create',
      actorId,
      entity: 'BookRequisition',
      entityId: created.id,
      details: { requisitionCode: created.requisitionCode },
    });

    return created;
  }

  async updateRequisition(actorId: string, id: string, payload: Partial<RequisitionInput>) {
    const current = await prisma.bookRequisition.findUnique({ where: { id } });
    if (!current) {
      throw new AppError('Book requisition not found', 404);
    }

    if (payload.applicationId) {
      await this.ensureApplicationExists(payload.applicationId);
    }

    if (payload.requisitionCode && payload.requisitionCode !== current.requisitionCode) {
      await this.ensureRequisitionCodeAvailable(payload.requisitionCode);
    }

    const shouldRecalculateTotal =
      payload.totalPrice === undefined &&
      (payload.quantity !== undefined || payload.pricePerUnit !== undefined);
    const nextQuantity = payload.quantity ?? current.quantity;
    const nextPricePerUnit =
      payload.pricePerUnit !== undefined
        ? payload.pricePerUnit
        : decimalToNumber(current.pricePerUnit);

    const updated = await prisma.bookRequisition.update({
      where: { id },
      data: {
        ...payload,
        totalPrice: shouldRecalculateTotal
          ? calculateTotalPrice(nextQuantity, nextPricePerUnit)
          : payload.totalPrice,
      },
      include: requisitionInclude,
    });

    logAuditEvent({
      action: 'procurement.requisition.update',
      actorId,
      entity: 'BookRequisition',
      entityId: id,
    });

    return updated;
  }

  async listVendors(query: PaginationQuery) {
    const { page, pageSize, skip } = pageMeta(query.page, query.pageSize);
    const where: Prisma.VendorWhereInput = {
      OR: query.q
        ? [
            { vendorCode: { contains: query.q } },
            { vendorName: { contains: query.q } },
            { quotationDetails: { contains: query.q } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { procurements: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async createVendor(actorId: string, payload: VendorInput) {
    await this.ensureVendorCodeAvailable(payload.vendorCode);

    const created = await prisma.vendor.create({
      data: payload,
      include: {
        _count: { select: { procurements: true } },
      },
    });

    logAuditEvent({
      action: 'procurement.vendor.create',
      actorId,
      entity: 'Vendor',
      entityId: created.id,
      details: { vendorCode: created.vendorCode },
    });

    return created;
  }

  async updateVendor(actorId: string, id: string, payload: Partial<VendorInput>) {
    const current = await prisma.vendor.findUnique({ where: { id } });
    if (!current) {
      throw new AppError('Vendor not found', 404);
    }

    if (payload.vendorCode && payload.vendorCode !== current.vendorCode) {
      await this.ensureVendorCodeAvailable(payload.vendorCode);
    }

    const updated = await prisma.vendor.update({
      where: { id },
      data: payload,
      include: {
        _count: { select: { procurements: true } },
      },
    });

    logAuditEvent({
      action: 'procurement.vendor.update',
      actorId,
      entity: 'Vendor',
      entityId: id,
    });

    return updated;
  }

  async listProcurements(query: ListProcurementsQuery) {
    const { page, pageSize, skip } = pageMeta(query.page, query.pageSize);
    const where: Prisma.ProcurementWhereInput = {
      requisitionId: query.requisitionId,
      vendorId: query.vendorId,
      procurementStatus: query.procurementStatus,
      shelvingStatus: query.shelvingStatus,
      OR: query.q
        ? [
            { procurementCode: { contains: query.q } },
            { bookReceivingRecord: { contains: query.q } },
            { requisition: { requisitionCode: { contains: query.q } } },
            { requisition: { bookTitle: { contains: query.q } } },
            { requisition: { authorName: { contains: query.q } } },
            { requisition: { isbn: { contains: query.q } } },
            { vendor: { vendorCode: { contains: query.q } } },
            { vendor: { vendorName: { contains: query.q } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.procurement.findMany({
        where,
        include: procurementInclude,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.procurement.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async createProcurement(actorId: string, payload: ProcurementInput) {
    await this.ensureRequisitionExists(payload.requisitionId);
    await this.ensureVendorExists(payload.vendorId);
    await this.ensureProcurementCodeAvailable(payload.procurementCode);

    const created = await prisma.procurement.create({
      data: {
        ...payload,
        procurementApprovalDate: parseDate(payload.procurementApprovalDate),
        deliveryDate: parseDate(payload.deliveryDate),
        handoverDateToIICT: parseDate(payload.handoverDateToIICT),
      },
      include: procurementInclude,
    });

    logAuditEvent({
      action: 'procurement.order.create',
      actorId,
      entity: 'Procurement',
      entityId: created.id,
      details: { procurementCode: created.procurementCode },
    });

    return created;
  }

  async updateProcurement(actorId: string, id: string, payload: Partial<ProcurementInput>) {
    const current = await prisma.procurement.findUnique({ where: { id } });
    if (!current) {
      throw new AppError('Procurement order not found', 404);
    }

    if (payload.requisitionId) {
      await this.ensureRequisitionExists(payload.requisitionId);
    }

    if (payload.vendorId) {
      await this.ensureVendorExists(payload.vendorId);
    }

    if (payload.procurementCode && payload.procurementCode !== current.procurementCode) {
      await this.ensureProcurementCodeAvailable(payload.procurementCode);
    }

    const updated = await prisma.procurement.update({
      where: { id },
      data: {
        ...payload,
        procurementApprovalDate: parseDate(payload.procurementApprovalDate),
        deliveryDate: parseDate(payload.deliveryDate),
        handoverDateToIICT: parseDate(payload.handoverDateToIICT),
      },
      include: procurementInclude,
    });

    logAuditEvent({
      action: 'procurement.order.update',
      actorId,
      entity: 'Procurement',
      entityId: id,
    });

    return updated;
  }

  private async ensureApplicationExists(id: string) {
    const application = await prisma.procurementApplication.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!application) {
      throw new AppError('Procurement application not found', 404);
    }
  }

  private async ensureRequisitionExists(id: string) {
    const requisition = await prisma.bookRequisition.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!requisition) {
      throw new AppError('Book requisition not found', 404);
    }
  }

  private async ensureVendorExists(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
  }

  private async ensureRequisitionCodeAvailable(requisitionCode: string) {
    const exists = await prisma.bookRequisition.findUnique({
      where: { requisitionCode },
      select: { id: true },
    });
    if (exists) {
      throw new AppError('A book requisition already exists with this code', 409);
    }
  }

  private async ensureVendorCodeAvailable(vendorCode: string) {
    const exists = await prisma.vendor.findUnique({
      where: { vendorCode },
      select: { id: true },
    });
    if (exists) {
      throw new AppError('A vendor already exists with this code', 409);
    }
  }

  private async ensureProcurementCodeAvailable(procurementCode: string) {
    const exists = await prisma.procurement.findUnique({
      where: { procurementCode },
      select: { id: true },
    });
    if (exists) {
      throw new AppError('A procurement order already exists with this code', 409);
    }
  }
}

export default new ProcurementService();
