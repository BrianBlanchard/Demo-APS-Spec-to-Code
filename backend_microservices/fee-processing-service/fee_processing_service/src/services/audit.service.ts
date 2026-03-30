import { logger } from '../utils/logger';
import { getTraceId } from '../utils/request-context';
import { maskSensitiveData } from '../utils/data-masking';

export interface IAuditService {
  logFeeAssessment(data: Record<string, unknown>): void;
  logFeePosted(data: Record<string, unknown>): void;
  logError(operation: string, error: Error, data?: Record<string, unknown>): void;
}

export class AuditService implements IAuditService {
  logFeeAssessment(data: Record<string, unknown>): void {
    const maskedData = maskSensitiveData(data);
    logger.info(
      {
        traceId: getTraceId(),
        event: 'FEE_ASSESSMENT_INITIATED',
        ...maskedData,
      },
      'Fee assessment initiated'
    );
  }

  logFeePosted(data: Record<string, unknown>): void {
    const maskedData = maskSensitiveData(data);
    logger.info(
      {
        traceId: getTraceId(),
        event: 'FEE_POSTED',
        ...maskedData,
      },
      'Fee posted successfully'
    );
  }

  logError(operation: string, error: Error, data?: Record<string, unknown>): void {
    const maskedData = data ? maskSensitiveData(data) : {};
    logger.error(
      {
        traceId: getTraceId(),
        operation,
        error: error.message,
        ...maskedData,
      },
      'Operation failed'
    );
  }
}
