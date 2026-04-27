import { z } from 'zod';
import { Department, ProcurementStatus, ShelvingStatus } from '@prisma/client';

const optionalDateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .optional();

const paginationQuery = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
};

const idParam = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

const applicationBody = z.object({
  applicationCode: z.string().min(1, 'Application code is required'),
  budgetYear: z.number().int().min(2000).max(2100),
  allocatedBudget: z.number().nonnegative(),
  department: z.nativeEnum(Department),
});

const requisitionBody = z.object({
  requisitionCode: z.string().min(1, 'Requisition code is required'),
  applicationId: z.string().min(1, 'Application is required'),
  bookTitle: z.string().min(1, 'Book title is required'),
  authorName: z.string().min(1, 'Author name is required'),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  isbn: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  pricePerUnit: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative().optional(),
});

const vendorBody = z.object({
  vendorCode: z.string().min(1, 'Vendor code is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  quotationDetails: z.string().optional(),
});

const procurementBodyBase = z.object({
  procurementCode: z.string().min(1, 'Procurement code is required'),
  requisitionId: z.string().min(1, 'Requisition is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  procurementApprovalDate: optionalDateString,
  deliveryDate: optionalDateString,
  handoverDateToIICT: optionalDateString,
  bookReceivingRecord: z.string().optional(),
  shelvingStatus: z.nativeEnum(ShelvingStatus).optional(),
  procurementStatus: z.nativeEnum(ProcurementStatus).optional(),
});

const dateOrderRefinement = (
  value: {
    procurementApprovalDate?: string;
    deliveryDate?: string;
    handoverDateToIICT?: string;
  },
  ctx: z.RefinementCtx
) => {
    const approval = value.procurementApprovalDate ? new Date(value.procurementApprovalDate) : undefined;
    const delivery = value.deliveryDate ? new Date(value.deliveryDate) : undefined;
    const handover = value.handoverDateToIICT ? new Date(value.handoverDateToIICT) : undefined;

    if (approval && delivery && delivery < approval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryDate'],
        message: 'Delivery date cannot be before approval date',
      });
    }

    if (delivery && handover && handover < delivery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['handoverDateToIICT'],
        message: 'Handover date cannot be before delivery date',
      });
    }
};

const procurementBody = procurementBodyBase.superRefine(dateOrderRefinement);

export const procurementIdParamSchema = idParam;

export const listApplicationsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    department: z.nativeEnum(Department).optional(),
    budgetYear: z.coerce.number().int().optional(),
    ...paginationQuery,
  }),
});

export const createApplicationSchema = z.object({
  body: applicationBody,
});

export const updateApplicationSchema = z.object({
  params: idParam.shape.params,
  body: applicationBody.partial(),
});

export const listRequisitionsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    applicationId: z.string().optional(),
    ...paginationQuery,
  }),
});

export const createRequisitionSchema = z.object({
  body: requisitionBody,
});

export const updateRequisitionSchema = z.object({
  params: idParam.shape.params,
  body: requisitionBody.partial(),
});

export const listVendorsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    ...paginationQuery,
  }),
});

export const createVendorSchema = z.object({
  body: vendorBody,
});

export const updateVendorSchema = z.object({
  params: idParam.shape.params,
  body: vendorBody.partial(),
});

export const listProcurementsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    requisitionId: z.string().optional(),
    vendorId: z.string().optional(),
    procurementStatus: z.nativeEnum(ProcurementStatus).optional(),
    shelvingStatus: z.nativeEnum(ShelvingStatus).optional(),
    ...paginationQuery,
  }),
});

export const createProcurementSchema = z.object({
  body: procurementBody,
});

export const updateProcurementSchema = z.object({
  params: idParam.shape.params,
  body: procurementBodyBase.partial().superRefine(dateOrderRefinement),
});
