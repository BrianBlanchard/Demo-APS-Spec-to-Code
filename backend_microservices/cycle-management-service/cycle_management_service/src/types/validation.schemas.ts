import { z } from 'zod';

export const CloseCycleRequestSchema = z.object({
  billingCycleEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD'),
  processingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD'),
});

export type CloseCycleRequestValidated = z.infer<typeof CloseCycleRequestSchema>;
