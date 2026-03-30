import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import type { ErrorResponse } from '../dto/categorize-response.dto';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CategoryNotFoundError extends AppError {
  constructor(mcc: string) {
    super(404, 'CATEGORY_NOT_FOUND', `Category not found for MCC: ${mcc}`);
    this.name = 'CategoryNotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, 'DATABASE_ERROR', message);
    this.name = 'DatabaseError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = (res.getHeader('X-Trace-ID') as string) || 'unknown';

  logger.error({
    err,
    traceId,
    path: req.path,
    method: req.method,
  });

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

  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
};
