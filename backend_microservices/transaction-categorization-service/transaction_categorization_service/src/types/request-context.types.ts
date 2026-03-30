export interface RequestContext {
  traceId: string;
  timestamp: string;
}

export interface AuditLogEntry {
  traceId: string;
  timestamp: string;
  operation: string;
  status: 'success' | 'failure' | 'retry';
  details?: Record<string, unknown>;
  error?: string;
}
