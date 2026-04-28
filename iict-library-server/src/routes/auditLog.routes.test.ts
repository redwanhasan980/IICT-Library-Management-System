import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    studentProfile: { findUnique: vi.fn(), create: vi.fn() },
    adminProfile: { findUnique: vi.fn(), create: vi.fn() },
    teacherProfile: { findUnique: vi.fn(), create: vi.fn() },
    auditLog: { findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));

const { default: auditLogRouter } = await import('./auditLog.routes');

const app = express();
app.use(express.json());
app.use('/audit-logs', auditLogRouter);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ENABLE_DEV_AUTH = 'true';
  process.env.NODE_ENV = 'test';
});

describe('audit log routes RBAC', () => {
  it('rejects audit log listing for non-admin users', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: 'student-user',
      email: 'student@example.com',
      name: 'Student One',
      role: Role.STUDENT,
    });
    mocks.prisma.studentProfile.findUnique.mockResolvedValue({
      id: 'student-profile',
      userId: 'student-user',
    });

    const response = await request(app)
      .get('/audit-logs')
      .set('x-user-id', 'student@example.com')
      .set('x-user-role', 'STUDENT');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Forbidden');
  });

  it('allows admins to list audit logs', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: 'admin-user',
      email: 'admin@example.com',
      name: 'Admin One',
      role: Role.ADMIN,
    });
    mocks.prisma.adminProfile.findUnique.mockResolvedValue({
      id: 'admin-profile',
      userId: 'admin-user',
    });
    mocks.prisma.auditLog.findMany.mockResolvedValue([]);
    mocks.prisma.auditLog.count.mockResolvedValue(0);

    const response = await request(app)
      .get('/audit-logs')
      .set('x-user-id', 'admin@example.com')
      .set('x-user-role', 'ADMIN');

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(0);
  });
});
