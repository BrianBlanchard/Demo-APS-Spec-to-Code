import logger from '../utils/logger';

export interface AuditLog {
  action: string;
  status: 'success' | 'failure' | 'retry';
  details?: Record<string, unknown>;
  error?: string;
}

export interface IAuditService {
  log(auditLog: AuditLog): void;
}

export class AuditService implements IAuditService {
  log(auditLog: AuditLog): void {
    const sanitized = this.maskSensitiveData(auditLog);
    logger.info(sanitized, `Audit: ${auditLog.action}`);
  }

  private maskSensitiveData(auditLog: AuditLog): AuditLog {
    const masked = { ...auditLog };

    if (masked.details) {
      masked.details = { ...masked.details };

      // Mask any fields that might contain sensitive data
      const sensitiveFields = ['userId', 'customerId', 'accountId', 'amount', 'balance'];

      for (const field of sensitiveFields) {
        if (field in masked.details) {
          masked.details[field] = '***MASKED***';
        }
      }
    }

    return masked;
  }
}
