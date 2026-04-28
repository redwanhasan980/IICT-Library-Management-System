import { z } from 'zod';
import { Department, LoanStatus, OutsideBookEntryStatus, ProcurementStatus, Role, ShelvingStatus } from '@prisma/client';

const dateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .optional();

export const issuedBooksReportSchema = z.object({
  query: z.object({
    from: dateString,
    to: dateString,
    status: z.union([z.nativeEnum(LoanStatus), z.literal('ALL')]).optional(),
    borrowerRole: z.union([z.literal(Role.STUDENT), z.literal(Role.TEACHER)]).optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const loanLifecycleReportSchema = z.object({
  query: z.object({
    from: dateString,
    to: dateString,
    borrowerRole: z.union([z.literal(Role.STUDENT), z.literal(Role.TEACHER)]).optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const outsideBooksReportSchema = z.object({
  query: z.object({
    from: dateString,
    to: dateString,
    status: z.union([z.nativeEnum(OutsideBookEntryStatus), z.literal('ALL')]).optional(),
    department: z.nativeEnum(Department).optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const catalogInventoryReportSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    department: z.nativeEnum(Department).optional(),
    includeArchived: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const procurementSummaryReportSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    procurementStatus: z.nativeEnum(ProcurementStatus).optional(),
    shelvingStatus: z.nativeEnum(ShelvingStatus).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const auditLogReportSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    actorId: z.string().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});
