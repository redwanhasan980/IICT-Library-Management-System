import { z } from 'zod';
import { Department, Role } from '@prisma/client';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: passwordSchema,
    role: z.enum([Role.STUDENT, Role.TEACHER]),
    studentRegNumber: z.string().min(1).optional(),
    teacherId: z.string().min(1).optional(),
    department: z.nativeEnum(Department),
    currentSemester: z.coerce.number().int().positive().optional(),
    designation: z.string().optional(),
    signatureData: z.string().optional(),
  }).superRefine((body, ctx) => {
    if (body.role === Role.STUDENT && !body.studentRegNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['studentRegNumber'], message: 'Student registration number is required' });
    }
    if (body.role === Role.TEACHER && !body.teacherId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['teacherId'], message: 'Teacher ID is required' });
    }
  }),
});

export const bootstrapAdminSchema = z.object({
  body: z.object({
    setupToken: z.string().min(1, 'Setup token is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: passwordSchema,
  }),
});
