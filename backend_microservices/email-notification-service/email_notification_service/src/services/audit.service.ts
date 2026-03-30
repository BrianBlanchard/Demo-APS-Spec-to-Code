import { logger } from '../config/logger.config';
import { getTraceId } from '../utils/async-local-storage';

export interface IAuditService {
  logEmailSent(notificationId: string, to: string, templateId: string): void;
  logEmailFailed(notificationId: string, to: string, error: string, retryCount: number): void;
  logRetryAttempt(notificationId: string, retryCount: number): void;
  logFinalFailure(notificationId: string, to: string): void;
}

export class AuditService implements IAuditService {
  logEmailSent(notificationId: string, to: string, templateId: string): void {
    logger.info(
      {
        event: 'EMAIL_SENT',
        notificationId,
        to: this.maskEmail(to),
        templateId,
        traceId: getTraceId(),
        timestamp: new Date().toISOString(),
      },
      'Email sent successfully'
    );
  }

  logEmailFailed(notificationId: string, to: string, error: string, retryCount: number): void {
    logger.error(
      {
        event: 'EMAIL_FAILED',
        notificationId,
        to: this.maskEmail(to),
        error: this.maskSensitiveData(error),
        retryCount,
        traceId: getTraceId(),
        timestamp: new Date().toISOString(),
      },
      'Email delivery failed'
    );
  }

  logRetryAttempt(notificationId: string, retryCount: number): void {
    logger.warn(
      {
        event: 'EMAIL_RETRY',
        notificationId,
        retryCount,
        traceId: getTraceId(),
        timestamp: new Date().toISOString(),
      },
      'Retrying email delivery'
    );
  }

  logFinalFailure(notificationId: string, to: string): void {
    logger.error(
      {
        event: 'EMAIL_FINAL_FAILURE',
        notificationId,
        to: this.maskEmail(to),
        traceId: getTraceId(),
        timestamp: new Date().toISOString(),
      },
      'Email delivery failed after all retry attempts'
    );
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
    return `${maskedLocal}@${domain}`;
  }

  private maskSensitiveData(data: string): string {
    // Mask potential sensitive information in error messages
    return data.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***');
  }
}
