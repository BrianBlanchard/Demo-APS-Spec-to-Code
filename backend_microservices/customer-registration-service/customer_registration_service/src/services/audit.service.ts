import { logger, getTraceId } from '../config/logger.config';
import { maskSensitiveData } from '../utils/encryption.util';

export interface AuditLogEntry {
  action: string;
  userId?: string;
  customerId?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export interface IAuditService {
  log(entry: AuditLogEntry): void;
}

export class AuditService implements IAuditService {
  log(entry: AuditLogEntry): void {
    const traceId = getTraceId();

    const auditLog = {
      timestamp: new Date().toISOString(),
      traceId,
      action: entry.action,
      userId: entry.userId,
      customerId: entry.customerId ? maskSensitiveData(entry.customerId, 4) : undefined,
      status: entry.status,
      details: this.maskSensitiveDetails(entry.details),
    };

    logger.info({ audit: auditLog }, 'Audit log entry');
  }

  private maskSensitiveDetails(
    details?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!details) {
      return undefined;
    }

    const masked = { ...details };

    // Mask sensitive fields
    const sensitiveFields = ['ssn', 'governmentId', 'eftAccountId'];

    for (const field of sensitiveFields) {
      if (masked[field] && typeof masked[field] === 'string') {
        masked[field] = maskSensitiveData(masked[field] as string, 4);
      }
    }

    return masked;
  }
}
