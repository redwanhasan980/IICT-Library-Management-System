import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
  bcryptCompare: vi.fn(),
  bcryptHash: vi.fn(),
  jwtSign: vi.fn(),
  logAuditEvent: vi.fn(),
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('bcryptjs', () => ({
  default: { compare: mocks.bcryptCompare, hash: mocks.bcryptHash },
}));
vi.mock('jsonwebtoken', () => ({
  default: { sign: mocks.jwtSign },
}));
vi.mock('../utils/auditLog', () => ({ logAuditEvent: mocks.logAuditEvent }));

const { default: authService } = await import('./auth.service');

const activeAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin One',
  role: Role.ADMIN,
  password: 'hashed-password',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  mocks.jwtSign.mockReturnValue('signed-token');
});

describe('authService audit logging', () => {
  it('logs successful login attempts', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(activeAdmin);
    mocks.bcryptCompare.mockResolvedValue(true);

    const result = await authService.login('ADMIN@EXAMPLE.COM', 'password', {
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(result.token).toBe('signed-token');
    expect(mocks.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'auth.login_success',
      actorId: activeAdmin.id,
      actorRole: Role.ADMIN,
      details: { email: 'admin@example.com' },
    }));
  });

  it('logs failed login attempts without storing passwords', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(activeAdmin);
    mocks.bcryptCompare.mockResolvedValue(false);

    await expect(authService.login('admin@example.com', 'wrong-password')).rejects.toThrow('Invalid email or password');

    expect(mocks.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'auth.login_failure',
      actorId: activeAdmin.id,
      details: { email: 'admin@example.com', reason: 'invalid_password' },
    }));
    expect(JSON.stringify(mocks.logAuditEvent.mock.calls[0][0])).not.toContain('wrong-password');
  });

  it('changes passwords with current password verification', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(activeAdmin);
    mocks.bcryptCompare.mockResolvedValue(true);
    mocks.bcryptHash.mockResolvedValue('new-hashed-password');
    mocks.prisma.user.update.mockResolvedValue({ ...activeAdmin, password: 'new-hashed-password' });

    await authService.changePassword(activeAdmin.id, 'old-password', 'new-password');

    expect(mocks.bcryptCompare).toHaveBeenCalledWith('old-password', activeAdmin.password);
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: activeAdmin.id },
      data: { password: 'new-hashed-password' },
    });
    expect(mocks.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      action: 'auth.password_change',
      actorId: activeAdmin.id,
    }));
    expect(JSON.stringify(mocks.logAuditEvent.mock.calls[0][0])).not.toContain('new-password');
  });
});
