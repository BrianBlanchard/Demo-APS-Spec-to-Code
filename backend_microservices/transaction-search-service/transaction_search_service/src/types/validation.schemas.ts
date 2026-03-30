import { z } from 'zod';

export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'startDate must be less than or equal to endDate' }
);

export const AmountRangeSchema = z.object({
  min: z.number().min(0, 'Minimum amount must be non-negative'),
  max: z.number().min(0, 'Maximum amount must be non-negative'),
}).refine(
  (data) => data.min <= data.max,
  { message: 'min must be less than or equal to max' }
);

export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1'),
  pageSize: z.number().int().min(1, 'Page size must be at least 1').max(100, 'Page size must not exceed 100'),
});

export const TransactionSearchRequestSchema = z.object({
  accountId: z.string().length(11, 'Account ID must be 11 characters').optional(),
  cardNumber: z.string().length(16, 'Card number must be 16 digits').optional(),
  dateRange: DateRangeSchema.optional(),
  amountRange: AmountRangeSchema.optional(),
  transactionTypes: z.array(z.string()).optional(),
  merchantName: z.string().optional(),
  sortBy: z.enum(['date', 'amount']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  pagination: PaginationSchema,
}).refine(
  (data) => data.accountId || data.cardNumber || data.dateRange,
  { message: 'At least one search criterion required (accountId, cardNumber, or dateRange)' }
);

export type ValidatedTransactionSearchRequest = z.infer<typeof TransactionSearchRequestSchema>;
