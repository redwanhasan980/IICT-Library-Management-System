import { Prisma } from '@prisma/client';
import prisma from '../config/database';

interface ListAuditLogsQuery {
  q?: string;
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

class AuditLogService {
  async list(query: ListAuditLogsQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {
      actorId: query.actorId,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      createdAt: query.from || query.to
        ? {
            gte: query.from ? new Date(query.from) : undefined,
            lte: query.to ? new Date(query.to) : undefined,
          }
        : undefined,
      OR: query.q
        ? [
            { action: { contains: query.q } },
            { entityType: { contains: query.q } },
            { entityId: { contains: query.q } },
            { actorId: { contains: query.q } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export default new AuditLogService();
