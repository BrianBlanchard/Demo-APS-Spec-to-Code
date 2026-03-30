export interface AuditLog {
  timestamp: string;
  traceId: string;
  action: string;
  userId?: string;
  accountId?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  errorMessage?: string;
}
