import { z } from 'zod';
import { LoanStatus, Role } from '@prisma/client';

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
