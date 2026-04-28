import { z } from 'zod';

export const listAuditLogsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    actorId: z.string().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  }),
});
