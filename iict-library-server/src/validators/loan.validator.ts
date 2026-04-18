import { z } from 'zod';

export const issueLoanSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    dueAt: z.string().datetime().optional(),
  }),
});

export const returnLoanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Loan ID is required'),
  }),
});

export const accessionLookupSchema = z.object({
  params: z.object({
    accessionNumber: z.string().min(1, 'Accession number is required'),
  }),
});
