import { logger } from '../config/logger.config';
import { getTraceId } from '../config/context.config';
import { maskSensitiveData } from '../utils/mask.util';
import {
  ValidateTransactionRequest,
  ValidationResponse,
} from '../dtos/validate-transaction.dto';

export interface IAuditService {
  logValidationRequest(request: ValidateTransactionRequest): void;
  logValidationResponse(response: ValidationResponse, durationMs: number): void;
  logValidationFailure(error: Error, durationMs: number): void;
}

export class AuditService implements IAuditService {
  logValidationRequest(request: ValidateTransactionRequest): void {
    const masked = maskSensitiveData(request as unknown as Record<string, unknown>);
    logger.info(
      {
        traceId: getTraceId(),
        event: 'validation_request',
        ...masked,
      },
      'Transaction validation requested'
    );
  }

  logValidationResponse(response: ValidationResponse, durationMs: number): void {
    logger.info(
      {
        traceId: getTraceId(),
        event: 'validation_response',
        validationId: response.validationId,
        result: response.validationResult,
        durationMs,
        ...(response.validationResult === 'declined' && {
          declineReason: response.declineReason,
        }),
      },
      'Transaction validation completed'
    );
  }

  logValidationFailure(error: Error, durationMs: number): void {
    logger.error(
      {
        traceId: getTraceId(),
        event: 'validation_failure',
        error: error.message,
        durationMs,
      },
      'Transaction validation failed'
    );
  }
}
