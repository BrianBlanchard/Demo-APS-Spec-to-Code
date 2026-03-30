import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { logger } from '../utils/logger';
import { getContext } from '../utils/context';
import { ZodError } from 'zod';

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const context = getContext();
  const traceId = context?.traceId || 'unknown';

  // Log error
  logger.error('Request error', error, {
    path: req.path,
    method: req.method,
    traceId,
  });

  // Handle known exceptions
  if (error instanceof BaseException) {
    const response: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      errorCode: 'VALIDATION_ERROR',
      message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(response);
}
