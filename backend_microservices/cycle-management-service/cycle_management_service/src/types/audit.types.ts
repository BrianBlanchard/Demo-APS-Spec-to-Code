export interface AuditLog {
  timestamp: string;
  traceId: string;
  operation: string;
  accountId?: string;
  billingCycle?: string;
  status: 'SUCCESS' | 'FAILURE' | 'RETRY';
  details?: Record<string, unknown>;
  error?: string;
}

export interface AuditContext {
  operation: string;
  metadata?: Record<string, unknown>;
}
