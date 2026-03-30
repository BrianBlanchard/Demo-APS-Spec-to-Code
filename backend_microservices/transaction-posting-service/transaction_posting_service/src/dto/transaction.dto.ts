import { z } from 'zod';

export const PostTransactionRequestSchema = z.object({
  validationId: z.string().min(1).max(30),
  authorizationCode: z.string().min(1).max(20),
  cardNumber: z.string().length(16).regex(/^\d{16}$/),
  transactionType: z.string().length(2).regex(/^0[1-6]$/),
  transactionCategory: z.string().length(4).regex(/^\d{4}$/),
  amount: z.number().positive().multipleOf(0.01),
  merchantId: z.string().min(1).max(10),
  merchantName: z.string().min(1).max(50),
  merchantCity: z.string().min(1).max(50),
  merchantZip: z.string().min(1).max(10),
  transactionSource: z.string().min(1).max(10),
  transactionDescription: z.string().min(1).max(100),
  originalTimestamp: z.string().datetime(),
});

export type PostTransactionRequest = z.infer<typeof PostTransactionRequestSchema>;

export interface PostTransactionResponse {
  transactionId: string;
  accountId: string;
  cardNumber: string;
  transactionType: string;
  transactionCategory: string;
  amount: number;
  transactionDescription: string;
  merchantName: string;
  merchantCity: string;
  originalTimestamp: string;
  postedTimestamp: string;
  previousBalance: number;
  newBalance: number;
  availableCredit: number;
  status: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}
