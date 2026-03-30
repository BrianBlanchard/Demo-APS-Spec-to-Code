import { z } from 'zod';

export const ReportTypeEnum = z.enum([
  'daily_summary',
  'declined_transactions',
  'merchant_analysis',
  'category_spending',
]);

export const ExportFormatEnum = z.enum(['pdf', 'csv']);

export const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const ReportRequestSchema = z.object({
  reportType: ReportTypeEnum,
  dateRange: DateRangeSchema,
  format: ExportFormatEnum,
  includeGraphs: z.boolean().optional().default(false),
});

export type ReportType = z.infer<typeof ReportTypeEnum>;
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type ReportRequestDto = z.infer<typeof ReportRequestSchema>;
