import type { Role } from './user.types';

export interface AuditLog {
  id: string;
  actorId?: string;
  actorRole?: Role;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogList {
  items: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
