import { z } from 'zod';

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export const loanIdParamSchema = z.object({
  params: z.object({
    loanId: z.string().min(1, 'Loan ID is required'),
  }),
});

export const recordFinePaymentSchema = z.object({
  body: z.object({
    loanId: z.string().min(1, 'Loan ID is required'),
    amount: z.number().positive('Amount must be greater than zero'),
    paymentDate: z.string().datetime().optional(),
    note: z.string().max(500).optional(),
  }),
});

export const unpaidFinesQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    role: z.enum(['STUDENT', 'TEACHER']).optional(),
  }),
});

export const paymentHistoryQuerySchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    loanId: z.string().optional(),
  }),
});
