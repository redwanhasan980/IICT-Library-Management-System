import { z } from 'zod';
import { Department, Role } from '@prisma/client';

const userPayloadSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
  studentRegNumber: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  department: z.nativeEnum(Department).optional(),
  currentSemester: z.coerce.number().int().positive().optional(),
  designation: z.string().optional(),
  signatureData: z.string().optional(),
});

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const createUserSchema = z.object({
  body: userPayloadSchema.extend({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.nativeEnum(Role),
  }).superRefine((body, ctx) => {
    if (body.role === Role.STUDENT && (!body.studentRegNumber || !body.department)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['studentRegNumber'], message: 'Student registration number and department are required' });
    }
    if (body.role === Role.TEACHER && (!body.teacherId || !body.department)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['teacherId'], message: 'Teacher ID and department are required' });
    }
  }),
});

export const updateUserSchema = z.object({
  params: userIdParamSchema.shape.params,
  body: userPayloadSchema,
});

export const activeStatusSchema = z.object({
  params: userIdParamSchema.shape.params,
  body: z.object({
    isActive: z.boolean(),
  }),
});
