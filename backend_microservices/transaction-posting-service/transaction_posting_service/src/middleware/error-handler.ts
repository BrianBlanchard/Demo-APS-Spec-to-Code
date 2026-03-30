import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorResponse } from '../dto/transaction.dto';
import { getTraceId } from './request-context';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = getTraceId();

  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    logger.error(
      {
        errorCode: err.errorCode,
        message: err.message,
        statusCode: err.statusCode,
        traceId,
        stack: err.stack,
      },
      'Application error occurred',
    );

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Unexpected errors
  logger.error(
    {
      message: err.message,
      traceId,
      stack: err.stack,
    },
    'Unexpected error occurred',
  );

  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
