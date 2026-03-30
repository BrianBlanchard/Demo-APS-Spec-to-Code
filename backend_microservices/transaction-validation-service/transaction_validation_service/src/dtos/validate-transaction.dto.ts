import { z } from 'zod';
import { TransactionType, TransactionSource } from '../models/transaction.model';

export type { ValidationResponse } from './validation-response.dto';

export const ValidateTransactionRequestSchema = z.object({
  cardNumber: z
    .string()
    .length(16, 'Card number must be exactly 16 digits')
    .regex(/^\d{16}$/, 'Card number must contain only digits'),
  transactionType: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Invalid transaction type. Must be 01-06' }),
  }),
  transactionCategory: z
    .string()
    .length(4, 'Transaction category must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Transaction category must be numeric'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
    .max(999999999999999, 'Amount exceeds maximum allowed value'),
  merchantId: z.string().min(1).max(10, 'Merchant ID must be at most 10 characters'),
  merchantName: z.string().min(1).max(50, 'Merchant name must be at most 50 characters'),
  merchantCity: z.string().min(1).max(50, 'Merchant city must be at most 50 characters'),
  merchantZip: z.string().min(1).max(10, 'Merchant ZIP must be at most 10 characters'),
  transactionTimestamp: z
    .string()
    .datetime({ message: 'Transaction timestamp must be valid ISO 8601 format' }),
  transactionSource: z.nativeEnum(TransactionSource, {
    errorMap: () => ({ message: 'Invalid transaction source. Must be POS, online, or ATM' }),
  }),
  cvv: z.string().length(3, 'CVV must be exactly 3 digits').regex(/^\d{3}$/).optional(),
});

export type ValidateTransactionRequest = z.infer<typeof ValidateTransactionRequestSchema>;
