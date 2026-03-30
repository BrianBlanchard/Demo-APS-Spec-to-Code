import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.config';
import { getTraceId } from '../config/context.config';
import { ErrorResponse, ErrorCode } from '../dtos/error-response.dto';
import {
  ValidationError,
  CardNotFoundError,
  DatabaseError,
  TimeoutError,
  UnauthorizedError,
} from '../errors/custom.errors';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  logger.error(
    {
      err,
      traceId,
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal server error';
  let details: unknown = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
    details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    errorCode = ErrorCode.INVALID_REQUEST;
    message = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorCode = ErrorCode.UNAUTHORIZED;
    message = err.message;
  } else if (err instanceof CardNotFoundError) {
    statusCode = 404;
    errorCode = ErrorCode.CARD_NOT_FOUND;
    message = err.message;
  } else if (err instanceof DatabaseError) {
    statusCode = 500;
    errorCode = ErrorCode.DATABASE_ERROR;
    message = 'Database operation failed';
  } else if (err instanceof TimeoutError) {
    statusCode = 504;
    errorCode = ErrorCode.TIMEOUT_ERROR;
    message = err.message;
  }

  const errorResponse: ErrorResponse = {
    errorCode,
    message,
    timestamp: new Date().toISOString(),
    traceId,
    details,
  };

  res.status(statusCode).json(errorResponse);
}
