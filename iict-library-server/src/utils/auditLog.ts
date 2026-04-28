import { Prisma, Role } from '@prisma/client';
import prisma from '../config/database';

interface AuditEvent {
  action: string;
  actorId?: string;
  actorRole?: Role;
  entity?: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const SENSITIVE_KEY_PATTERN = /(password|token|secret|credential|authorization|cookie)/i;

export const sanitizeAuditMetadata = (value: unknown, key = ''): unknown => {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return '[REDACTED]';
  }

  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeAuditMetadata(item))
      .filter((item) => item !== undefined);
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [entryKey, entryValue]) => {
      const sanitized = sanitizeAuditMetadata(entryValue, entryKey);
      if (sanitized !== undefined) {
        acc[entryKey] = sanitized;
      }
      return acc;
    }, {});
  }

  return String(value);
};

export const logAuditEvent = ({
  action,
  actorId,
  actorRole,
  entity,
  entityType,
  entityId,
  details,
  metadata,
  ipAddress,
  userAgent,
}: AuditEvent) => {
  const auditClient = (prisma as typeof prisma & { auditLog?: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> } })
    .auditLog;

  if (!auditClient || typeof auditClient.create !== 'function') {
    // eslint-disable-next-line no-console
    console.warn('[AUDIT_LOG_MISSING] Prisma client is missing AuditLog model.');
    return;
  }

  const safeMetadata = sanitizeAuditMetadata(metadata ?? details) as Prisma.InputJsonValue | undefined;

  void auditClient.create({
    data: {
      action,
      actorId,
      actorRole,
      entityType: entityType ?? entity,
      entityId,
      metadata: safeMetadata,
      ipAddress,
      userAgent,
    },
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AUDIT_LOG_WRITE_FAILED]', message);
  });
};
