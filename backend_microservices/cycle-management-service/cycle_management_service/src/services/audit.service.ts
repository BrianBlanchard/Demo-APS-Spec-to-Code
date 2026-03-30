import { logger } from '../config/logger.config';
import { AuditLog, AuditContext } from '../types/audit.types';
import { getTraceId } from '../utils/context.util';
import { maskSensitiveData } from '../utils/mask.util';

export interface IAuditService {
  logSuccess(context: AuditContext): void;
  logFailure(context: AuditContext, error: string): void;
  logRetry(context: AuditContext, attempt: number): void;
}

export class AuditService implements IAuditService {
  logSuccess(context: AuditContext): void {
    const auditLog = this.createAuditLog(context, 'SUCCESS');
    logger.info(auditLog, `Operation ${context.operation} completed successfully`);
  }

  logFailure(context: AuditContext, error: string): void {
    const auditLog = this.createAuditLog(context, 'FAILURE', error);
    logger.error(auditLog, `Operation ${context.operation} failed`);
  }

  logRetry(context: AuditContext, attempt: number): void {
    const auditLog = this.createAuditLog(context, 'RETRY', undefined, { attempt });
    logger.warn(auditLog, `Operation ${context.operation} retry attempt ${attempt}`);
  }

  private createAuditLog(
    context: AuditContext,
    status: 'SUCCESS' | 'FAILURE' | 'RETRY',
    error?: string,
    additionalDetails?: Record<string, unknown>
  ): AuditLog {
    const maskedMetadata = context.metadata ? maskSensitiveData(context.metadata) : undefined;

    return {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      operation: context.operation,
      accountId: maskedMetadata?.accountId as string | undefined,
      billingCycle: maskedMetadata?.billingCycle as string | undefined,
      status,
      details: {
        ...maskedMetadata,
        ...additionalDetails,
      },
      error,
    };
  }
}
