import { z } from 'zod';
import { Department, OutsideBookEntryStatus } from '@prisma/client';

export const createOutsideBookEntrySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    studentRegNumber: z.string().min(1, 'Student registration number is required'),
    department: z.nativeEnum(Department),
    currentSemester: z.coerce.number().int().positive('Current semester must be a positive number'),
  }),
});

export const verifyOutsideBookEntrySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Entry ID is required'),
  }),
});

export const listOutsideBookEntriesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: z.nativeEnum(OutsideBookEntryStatus).optional(),
    verifiedEntry: z.enum(['true', 'false']).optional(),
    verifiedExit: z.enum(['true', 'false']).optional(),
    department: z.nativeEnum(Department).optional(),
    studentRegNumber: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  }),
});

export const exitOutsideBookEntrySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Entry ID is required'),
  }),
});
