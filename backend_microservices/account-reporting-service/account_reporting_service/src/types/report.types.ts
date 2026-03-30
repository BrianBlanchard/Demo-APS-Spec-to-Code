export const ReportType = {
  ACCOUNT_STATUS: 'account_status',
  CREDIT_UTILIZATION: 'credit_utilization',
  DELINQUENCY: 'delinquency',
  MONTHLY_STATEMENT: 'monthly_statement',
} as const;

export type ReportTypeValue = (typeof ReportType)[keyof typeof ReportType];

export const ReportFormat = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
} as const;

export type ReportFormatValue = (typeof ReportFormat)[keyof typeof ReportFormat];

export const AccountStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
} as const;

export type AccountStatusValue = (typeof AccountStatus)[keyof typeof AccountStatus];
