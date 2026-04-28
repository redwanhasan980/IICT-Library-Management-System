import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  prisma: {
    auditLog: { create: vi.fn() },
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));

const { logAuditEvent, sanitizeAuditMetadata } = await import('./auditLog');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.auditLog.create.mockResolvedValue({});
});

describe('auditLog utility', () => {
  it('redacts sensitive metadata recursively', () => {
    const result = sanitizeAuditMetadata({
      email: 'admin@example.com',
      password: 'secret',
      nested: {
        authToken: 'token-value',
        safe: 'value',
      },
    });

    expect(result).toEqual({
      email: 'admin@example.com',
      password: '[REDACTED]',
      nested: {
        authToken: '[REDACTED]',
        safe: 'value',
      },
    });
  });

  it('persists audit events with sanitized metadata', () => {
    logAuditEvent({
      action: 'auth.login_success',
      actorId: 'admin-1',
      actorRole: Role.ADMIN,
      entity: 'User',
      entityId: 'admin-1',
      details: { email: 'admin@example.com', token: 'not-stored' },
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'auth.login_success',
        actorId: 'admin-1',
        actorRole: Role.ADMIN,
        entityType: 'User',
        entityId: 'admin-1',
        metadata: { email: 'admin@example.com', token: '[REDACTED]' },
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      }),
    });
  });
});
