import { z } from 'zod';

export const importBooksSchema = z.object({
  body: z.object({
    csv: z.string().min(1, 'CSV content is required'),
  }),
});

export const exportResourceSchema = z.object({
  params: z.object({
    resource: z.enum(['books', 'loans', 'outside-books', 'members']),
  }),
});
