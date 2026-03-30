import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { logger } from '../config/logger';
import { getTraceId } from '../utils/tracing';
import { ErrorResponseDTO } from '../types/dtos';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  // Log error
  logger.error(
    {
      err,
      method: req.method,
      path: req.path,
      traceId,
    },
    'Request error'
  );

  // Handle AppError instances
  if (err instanceof AppError) {
    const response: ErrorResponseDTO = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
      details: err.details,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponseDTO = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(response);
}
