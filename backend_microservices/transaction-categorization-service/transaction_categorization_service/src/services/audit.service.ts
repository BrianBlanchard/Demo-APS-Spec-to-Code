import logger from '../utils/logger';
import type { AuditLogEntry } from '../types/request-context.types';

export interface IAuditService {
  logOperation(
    operation: string,
    status: 'success' | 'failure' | 'retry',
    details?: Record<string, unknown>,
    error?: string
  ): void;
}

export class AuditService implements IAuditService {
  logOperation(
    operation: string,
    status: 'success' | 'failure' | 'retry',
    details?: Record<string, unknown>,
    error?: string
  ): void {
    const auditEntry: Omit<AuditLogEntry, 'traceId' | 'timestamp'> = {
      operation,
      status,
      details: this.maskSensitiveData(details),
      error,
    };

    if (status === 'success') {
      logger.info(auditEntry, 'Operation completed successfully');
    } else if (status === 'failure') {
      logger.error(auditEntry, 'Operation failed');
    } else {
      logger.warn(auditEntry, 'Operation retry');
    }
  }

  private maskSensitiveData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return undefined;

    const masked = { ...data };

    // Mask sensitive fields if present
    const sensitiveFields = [
      'accountId',
      'customerId',
      'customerName',
      'merchantName',
      'amount',
    ];

    sensitiveFields.forEach((field) => {
      if (field in masked) {
        if (field === 'amount') {
          masked[field] = '***.**';
        } else {
          const value = String(masked[field]);
          masked[field] = value.length > 4 ? `***${value.slice(-4)}` : '***';
        }
      }
    });

    return masked;
  }
}
