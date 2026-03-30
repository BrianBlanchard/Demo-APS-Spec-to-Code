import { createLogger } from '../utils/logger';

const logger = createLogger('AuditService');

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export interface IAuditService {
  logEvent(event: AuditEvent): void;
}

export class AuditService implements IAuditService {
  logEvent(event: AuditEvent): void {
    const maskedDetails = this.maskSensitiveData(event.details);

    logger.info(
      {
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId ? this.maskId(event.resourceId) : undefined,
        status: event.status,
        details: maskedDetails,
      },
      'Audit event logged'
    );
  }

  private maskSensitiveData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return undefined;

    const masked = { ...data };

    const sensitiveFields = ['accountId', 'customerId', 'balance', 'creditLimit'];

    sensitiveFields.forEach((field) => {
      if (field in masked) {
        masked[field] = '***MASKED***';
      }
    });

    return masked;
  }

  private maskId(id: string): string {
    if (id.length <= 4) return '****';
    return id.substring(0, 4) + '****';
  }
}
