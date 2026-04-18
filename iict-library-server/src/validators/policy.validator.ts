import { z } from 'zod';

export const updatePolicySchema = z.object({
  body: z.object({
    studentBorrowDurationDays: z.number().int().min(1).max(180).optional(),
    teacherBorrowDurationDays: z.number().int().min(1).max(365).optional(),
    maxActiveLoansStudent: z.number().int().min(1).max(50).optional(),
    maxActiveLoansTeacher: z.number().int().min(1).max(100).optional(),
    finePerDay: z.number().min(0).max(10000).optional(),
    reservationExpiryHours: z.number().int().min(1).max(720).optional(),
    outsideBookEnabled: z.boolean().optional(),
  }),
});
