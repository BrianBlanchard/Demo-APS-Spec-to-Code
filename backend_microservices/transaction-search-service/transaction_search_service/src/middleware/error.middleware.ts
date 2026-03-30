import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { getTraceId } from '../utils/context.storage';
import { ErrorResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();
  const timestamp = new Date().toISOString();

  logger.error({
    err,
    traceId,
    path: req.path,
    method: req.method,
  }, 'Request error');

  if (err instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      errorCode: 'VALIDATION_ERROR',
      message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      timestamp,
      traceId,
    };
    res.status(400).json(errorResponse);
    return;
  }

  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp,
      traceId,
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
    traceId,
  };
  res.status(500).json(errorResponse);
}
