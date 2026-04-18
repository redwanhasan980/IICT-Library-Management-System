import { z } from 'zod';

export const createAuditSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    notes: z.string().optional(),
  }),
});

export const auditSessionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Audit session ID is required'),
  }),
});

export const addScanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Audit session ID is required'),
  }),
  body: z.object({
    accessionNumber: z.string().min(1, 'Accession number is required'),
  }),
});

export const bulkAddScansSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Audit session ID is required'),
  }),
  body: z.object({
    accessionNumbers: z.array(z.string().min(1)).min(1),
  }),
});

export const listAuditResultsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Audit session ID is required'),
  }),
  query: z.object({
    status: z
      .enum([
        'FOUND',
        'MISSING',
        'EXTRA_OR_UNMATCHED',
        'ISSUED_DURING_AUDIT',
        'INACTIVE_OR_ARCHIVED',
      ])
      .optional(),
  }),
});
