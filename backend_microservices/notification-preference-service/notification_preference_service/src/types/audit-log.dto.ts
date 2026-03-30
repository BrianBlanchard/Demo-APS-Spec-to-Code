export interface AuditLogDto {
  action: string;
  customerId: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: string;
  traceId: string;
}
