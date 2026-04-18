import { z } from 'zod';

export const listBooksSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    includeArchived: z
      .enum(['true', 'false'])
      .optional(),
    page: z.string().optional(),
    pageSize: z.string().optional(),
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
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    accessionNumber: z.string().min(1, 'Accession number is required'),
    isbn: z.string().optional(),
    department: z.string().optional(),
    totalCopies: z.number().int().positive().optional(),
  }),
});

export const archiveBookSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Book ID is required'),
  }),
  body: z.object({
    isArchived: z.boolean(),
  }),
});
