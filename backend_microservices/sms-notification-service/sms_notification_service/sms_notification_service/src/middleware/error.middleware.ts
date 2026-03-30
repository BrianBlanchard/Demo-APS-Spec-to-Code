import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { ErrorResponse } from '../dtos/sms.dto';
import { getTraceId } from './tracing.middleware';
import { logger } from '../services/logger.service';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  // Log error with trace context
  logger.error(
    {
      err,
      traceId,
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  // Handle known application errors
  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
