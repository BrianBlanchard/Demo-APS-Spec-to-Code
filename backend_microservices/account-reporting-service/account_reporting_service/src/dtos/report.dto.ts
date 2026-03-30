import { z } from 'zod';
import { ReportType, ReportFormat } from '../types/report.types';

export const GenerateReportRequestSchema = z.object({
  reportType: z.enum([
    ReportType.ACCOUNT_STATUS,
    ReportType.CREDIT_UTILIZATION,
    ReportType.DELINQUENCY,
    ReportType.MONTHLY_STATEMENT,
  ]),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  format: z.enum([ReportFormat.CSV, ReportFormat.JSON, ReportFormat.PDF]),
});

export type GenerateReportRequestDto = z.infer<typeof GenerateReportRequestSchema>;

export interface GenerateReportResponseDto {
  reportId: string;
  reportType: string;
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  closedAccounts: number;
  downloadUrl: string;
}

export interface ErrorResponseDto {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}
