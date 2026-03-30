import { z } from 'zod';
import { TransactionType } from './account.types';

export const AccountIdParamSchema = z.object({
  accountId: z.string().length(11, 'Account ID must be exactly 11 digits'),
});

export const BalanceUpdateRequestSchema = z.object({
  transactionId: z.string().length(16, 'Transaction ID must be exactly 16 characters'),
  transactionType: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  isDebit: z.boolean(),
  timestamp: z.string().datetime(),
});

export type AccountIdParam = z.infer<typeof AccountIdParamSchema>;
export type BalanceUpdateRequestDto = z.infer<typeof BalanceUpdateRequestSchema>;
