import { ReportType, ExportFormat } from '../dto/report-request.dto';

export interface ReportEntity {
  id: string;
  reportId: string;
  reportType: ReportType;
  startDate: Date;
  endDate: Date;
  format: ExportFormat;
  includeGraphs: boolean;
  generatedAt: Date;
  expiresAt: Date;
  downloadUrl: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const ReportStatusValues = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ReportStatus = typeof ReportStatusValues[keyof typeof ReportStatusValues];
