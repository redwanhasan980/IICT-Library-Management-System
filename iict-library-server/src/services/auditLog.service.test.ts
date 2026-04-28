import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: {
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));

const { default: auditLogService } = await import('./auditLog.service');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auditLogService', () => {
  it('lists audit logs with filters and pagination metadata', async () => {
    mocks.prisma.auditLog.findMany.mockResolvedValue([{
      id: 'audit-1',
      action: 'loan.issue',
      actorId: 'admin-1',
      entityType: 'Loan',
      entityId: 'loan-1',
      createdAt: new Date('2026-04-28T00:00:00.000Z'),
    }]);
    mocks.prisma.auditLog.count.mockResolvedValue(1);

    const result = await auditLogService.list({
      q: 'loan',
      actorId: 'admin-1',
      entityType: 'Loan',
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-30T23:59:59.000Z',
      page: 2,
      pageSize: 5,
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(5);
    expect(mocks.prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 5,
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: expect.objectContaining({
        actorId: 'admin-1',
        entityType: 'Loan',
      }),
    }));
  });
});
