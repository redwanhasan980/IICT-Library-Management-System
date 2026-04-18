interface AuditEvent {
  action: string;
  actorId?: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export const logAuditEvent = ({
  action,
  actorId,
  entity,
  entityId,
  details,
}: AuditEvent) => {
  const payload = {
    ts: new Date().toISOString(),
    action,
    actorId,
    entity,
    entityId,
    details,
  };

  // Placeholder logger. Replace with persistent audit storage in future phases.
  console.info('[AUDIT]', JSON.stringify(payload));
};
