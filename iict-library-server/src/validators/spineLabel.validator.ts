import { z } from 'zod';

export const generateSpineLabelSchema = z.object({
  body: z.object({
    accessionNumber: z.string().min(1, 'Accession number is required'),
    authorCode: z.string().min(1, 'Author code is required'),
    classificationNumber: z.string().min(1, 'Classification number is required'),
  }),
});

export type GenerateSpineLabelInput = z.infer<typeof generateSpineLabelSchema>;
