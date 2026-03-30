import { z } from 'zod';
import { FeeType } from '../types/fee-types';

export const FeeAssessmentRequestSchema = z.object({
  accountId: z
    .string()
    .length(11, 'Account ID must be exactly 11 digits')
    .regex(/^\d{11}$/, 'Account ID must contain only digits'),
  feeType: z.nativeEnum(FeeType, {
    errorMap: () => ({ message: 'Invalid fee type' }),
  }),
  amount: z
    .number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  reason: z.string().trim().min(1, 'Reason is required'),
});

export type FeeAssessmentRequestDto = z.infer<typeof FeeAssessmentRequestSchema>;
