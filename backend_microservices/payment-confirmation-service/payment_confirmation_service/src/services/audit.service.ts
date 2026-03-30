import { createLogger } from '../config/logger.config';

const logger = createLogger('AuditService');

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export class AuditService {
  logEvent(event: AuditEvent): void {
    const sanitizedEvent = this.sanitizeSensitiveData(event);
    logger.info(sanitizedEvent, `Audit: ${event.action}`);
  }

  private sanitizeSensitiveData(event: AuditEvent): AuditEvent {
    const sanitized = { ...event };

    if (sanitized.resourceId) {
      sanitized.resourceId = this.maskData(sanitized.resourceId);
    }

    if (sanitized.details) {
      sanitized.details = this.maskObjectData(sanitized.details);
    }

    return sanitized;
  }

  private maskData(value: string): string {
    if (value.length <= 4) return '***';
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }

  private maskObjectData(obj: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    const sensitiveFields = ['accountId', 'transactionId', 'paymentAmount'];

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.includes(key) && typeof value === 'string') {
        masked[key] = this.maskData(value);
      } else if (sensitiveFields.includes(key) && typeof value === 'number') {
        masked[key] = '***';
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}
