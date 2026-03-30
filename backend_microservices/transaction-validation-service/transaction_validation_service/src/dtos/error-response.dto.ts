export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
  details?: unknown;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
