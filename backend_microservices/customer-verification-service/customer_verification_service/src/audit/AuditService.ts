import { logger } from '../logging/logger';
import { getRequestContext } from '../middleware/requestContext';

export interface AuditService {
  logVerificationInitiated(
    verificationId: string,
    customerId: string,
    verificationType: string
  ): void;
  logVerificationCompleted(
    verificationId: string,
    customerId: string,
    overallResult: string
  ): void;
  logCheckStarted(verificationId: string, checkType: string): void;
  logCheckCompleted(verificationId: string, checkType: string, result: string): void;
  logCheckFailed(verificationId: string, checkType: string, error: string): void;
  logRetryAttempt(verificationId: string, checkType: string, attemptNumber: number): void;
  logManualReviewRequired(verificationId: string, reason: string): void;
}

export class AuditServiceImpl implements AuditService {
  logVerificationInitiated(
    verificationId: string,
    customerId: string,
    verificationType: string
  ): void {
    const context = getRequestContext();
    logger.info(
      {
        event: 'verification_initiated',
        verificationId: this.maskId(verificationId),
        customerId: this.maskId(customerId),
        verificationType,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      'Verification initiated'
    );
  }

  logVerificationCompleted(
    verificationId: string,
    customerId: string,
    overallResult: string
  ): void {
    const context = getRequestContext();
    logger.info(
      {
        event: 'verification_completed',
        verificationId: this.maskId(verificationId),
        customerId: this.maskId(customerId),
        overallResult,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      'Verification completed'
    );
  }

  logCheckStarted(verificationId: string, checkType: string): void {
    const context = getRequestContext();
    logger.info(
      {
        event: 'check_started',
        verificationId: this.maskId(verificationId),
        checkType,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      `Check started: ${checkType}`
    );
  }

  logCheckCompleted(verificationId: string, checkType: string, result: string): void {
    const context = getRequestContext();
    logger.info(
      {
        event: 'check_completed',
        verificationId: this.maskId(verificationId),
        checkType,
        result,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      `Check completed: ${checkType} - ${result}`
    );
  }

  logCheckFailed(verificationId: string, checkType: string, error: string): void {
    const context = getRequestContext();
    logger.error(
      {
        event: 'check_failed',
        verificationId: this.maskId(verificationId),
        checkType,
        error,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      `Check failed: ${checkType}`
    );
  }

  logRetryAttempt(verificationId: string, checkType: string, attemptNumber: number): void {
    const context = getRequestContext();
    logger.warn(
      {
        event: 'retry_attempt',
        verificationId: this.maskId(verificationId),
        checkType,
        attemptNumber,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      `Retry attempt ${attemptNumber} for ${checkType}`
    );
  }

  logManualReviewRequired(verificationId: string, reason: string): void {
    const context = getRequestContext();
    logger.warn(
      {
        event: 'manual_review_required',
        verificationId: this.maskId(verificationId),
        reason,
        timestamp: new Date().toISOString(),
        traceId: context?.traceId,
      },
      'Manual review required'
    );
  }

  private maskId(id: string): string {
    if (id.length <= 4) return '****';
    return `${id.substring(0, 2)}***${id.substring(id.length - 2)}`;
  }
}
