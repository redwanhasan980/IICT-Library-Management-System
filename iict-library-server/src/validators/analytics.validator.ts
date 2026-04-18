import { z } from 'zod';

export const analyticsDateRangeSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});
