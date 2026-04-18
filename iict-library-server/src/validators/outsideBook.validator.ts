import { z } from 'zod';

export const createOutsideBookEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
});

export const verifyOutsideBookEntrySchema = z.object({
  id: z.string().min(1, 'Entry ID is required'),
});
