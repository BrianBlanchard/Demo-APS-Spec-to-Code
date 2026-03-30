import { logger } from '../utils/logger';

export interface AuditEvent {
  eventType: string;
  accountId: string;
  userId: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface IAuditService {
  logStatusChange(event: AuditEvent): void;
  logRetry(accountId: string, attempt: number, maxAttempts: number): void;
  logFailure(accountId: string, reason: string, error: Error): void;
}

export class AuditService implements IAuditService {
  logStatusChange(event: AuditEvent): void {
    logger.info('Account status change audit', {
      eventType: event.eventType,
      accountId: event.accountId,
      userId: event.userId,
      action: event.action,
      previousValue: event.previousValue,
      newValue: event.newValue,
      reason: event.reason,
      success: event.success,
      errorMessage: event.errorMessage,
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    });
  }

  logRetry(accountId: string, attempt: number, maxAttempts: number): void {
    logger.warn('Notification retry attempt', {
      accountId,
      attempt,
      maxAttempts,
      timestamp: new Date().toISOString(),
    });
  }

  logFailure(accountId: string, reason: string, error: Error): void {
    logger.error('Status change operation failed', error, {
      accountId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}
