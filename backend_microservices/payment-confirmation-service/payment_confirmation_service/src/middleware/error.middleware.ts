import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/payment.types';
import { getRequestContext } from '../config/async-context.config';
import { createLogger } from '../config/logger.config';

const logger = createLogger('ErrorMiddleware');

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

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'PAYMENT_NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const context = getRequestContext();
  const traceId = context?.traceId || 'unknown';
  const timestamp = new Date().toISOString();

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  // Log error with trace context
  logger.error(
    {
      statusCode,
      errorCode,
      message: err.message,
      stack: statusCode === 500 ? err.stack : undefined,
    },
    'Request error'
  );

  const errorResponse: ErrorResponse = {
    errorCode,
    message,
    timestamp,
    traceId,
  };

  res.status(statusCode).json(errorResponse);
};
