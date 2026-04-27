import { z } from 'zod';

export const issueLoanSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, 'Book ID is required').optional(),
    accessionNumber: z.string().min(1, 'Accession number is required').optional(),
    userId: z.string().min(1, 'User ID is required').optional(),
    studentRegNumber: z.string().min(1, 'Student registration number is required').optional(),
    teacherId: z.string().min(1, 'Teacher ID is required').optional(),
    dueAt: z.string().datetime().optional(),
    facultySignatureText: z.string().min(1).optional(),
  }).refine((body) => body.bookId || body.accessionNumber, {
    message: 'Book ID or accession number is required',
    path: ['accessionNumber'],
  }).refine((body) => body.userId || body.studentRegNumber || body.teacherId, {
    message: 'Borrower user ID, student registration number, or teacher ID is required',
    path: ['userId'],
  }),
});

export const returnLoanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Loan ID is required'),
  }),
});

export const loanIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Loan ID is required'),
  }),
});

export const borrowerHistoryParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'Borrower user ID is required'),
  }),
});

export const bookHistoryParamSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
  }),
});

export const accessionLookupSchema = z.object({
  params: z.object({
    accessionNumber: z.string().min(1, 'Accession number is required'),
  }),
});

export const listLoansSchema = z.object({
  query: z.object({
    status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE']).optional(),
    overdue: z.enum(['true', 'false']).optional(),
    borrowerRole: z.enum(['STUDENT', 'TEACHER']).optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});
