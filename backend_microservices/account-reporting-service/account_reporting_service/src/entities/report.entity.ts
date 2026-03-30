import { ReportTypeValue, ReportFormatValue } from '../types/report.types';

export interface ReportEntity {
  reportId: string;
  reportType: ReportTypeValue;
  asOfDate: Date;
  format: ReportFormatValue;
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  closedAccounts: number;
  downloadUrl: string;
  createdAt: Date;
}
