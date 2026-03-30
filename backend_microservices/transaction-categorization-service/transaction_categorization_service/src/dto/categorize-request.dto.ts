import { z } from 'zod';

export const CategorizeRequestSchema = z.object({
  merchantCategoryCode: z
    .string()
    .length(4, 'Merchant category code must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Merchant category code must contain only digits'),
  merchantName: z
    .string()
    .min(1, 'Merchant name is required')
    .max(255, 'Merchant name cannot exceed 255 characters'),
  amount: z.number().positive('Amount must be positive'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
});

export type CategorizeRequest = z.infer<typeof CategorizeRequestSchema>;
