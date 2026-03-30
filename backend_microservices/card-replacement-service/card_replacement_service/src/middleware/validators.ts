import { z } from 'zod';
import { ReplacementReason } from '../types/enums';

const deliveryAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2).max(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
});

export const cardReplacementRequestSchema = z.object({
  replacementReason: z.enum([
    ReplacementReason.LOST_OR_STOLEN,
    ReplacementReason.DAMAGED,
    ReplacementReason.EXPIRING_SOON,
    ReplacementReason.FRAUD_PREVENTION,
  ] as const, {
    errorMap: () => ({ message: 'Invalid replacement reason' }),
  }),
  deliveryAddress: deliveryAddressSchema,
  expeditedShipping: z.boolean().optional().default(false),
  notifyCustomer: z.boolean(),
});

export const cardNumberParamSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
});

export type CardReplacementRequestValidated = z.infer<typeof cardReplacementRequestSchema>;
export type CardNumberParamValidated = z.infer<typeof cardNumberParamSchema>;
