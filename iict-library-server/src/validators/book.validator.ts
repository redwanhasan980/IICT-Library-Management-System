import { z } from 'zod';
import { BindingType, BookSource, Department } from '@prisma/client';

const baseBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  accessionNumber: z.string().min(1, 'Accession number is required'),
  authorEditor: z.string().optional(),
  edition: z.string().optional(),
  volume: z.string().optional(),
  placeOfPublication: z.string().optional(),
  publisher: z.string().optional(),
  dateOfPublication: z.string().optional(),
  source: z.nativeEnum(BookSource).optional(),
  binding: z.nativeEnum(BindingType).optional(),
  pagination: z.number().int().positive().optional(),
  billNumber: z.string().optional(),
  billDate: z.string().optional(),
  isbn: z.string().optional(),
  department: z.nativeEnum(Department).optional(),
  subjectCategory: z.string().optional(),
  deweyDecimalNumber: z.number().optional(),
  cutterCode: z.string().optional(),
  callNumber: z.string().optional(),
  locationCode: z.string().optional(),
  catalogEntryDate: z.string().optional(),
  catalogedById: z.string().optional(),
  barcode: z.string().optional(),
  procurementId: z.string().optional(),
  totalCopies: z.number().int().positive().optional(),
});

export const listBooksSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    includeArchived: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  }),
});

export const bookIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Book ID is required'),
  }),
});

export const accessionParamSchema = z.object({
  params: z.object({
    accessionNumber: z.string().min(1, 'Accession number is required'),
  }),
});

export const createBookSchema = z.object({
  body: baseBookSchema,
});

export const updateBookSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Book ID is required'),
  }),
  body: baseBookSchema.partial(),
});

export const archiveBookSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Book ID is required'),
  }),
  body: z.object({
    isArchived: z.boolean(),
  }),
});
