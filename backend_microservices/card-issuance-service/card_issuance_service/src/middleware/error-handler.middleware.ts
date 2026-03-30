import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/error-response';
import { AsyncContext } from '../context/async-context';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = AsyncContext.getTraceId();

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

  // Handle validation errors from zod
  if (err.name === 'ZodError') {
    const errorResponse: ErrorResponse = {
      errorCode: 'VALIDATION_ERROR',
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Handle unexpected errors
  console.error('Unexpected error:', err);

  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
