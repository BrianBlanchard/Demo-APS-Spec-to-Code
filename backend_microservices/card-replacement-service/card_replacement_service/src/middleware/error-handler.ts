import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { ErrorResponse } from '../types/dtos';
import { getTraceId } from '../utils/trace-context';
import { logger } from '../config/logger';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = getTraceId();

  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    logger.error(
      {
        traceId,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        message: error.message,
        stack: error.stack,
      },
      'Application error occurred',
    );

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  logger.error(
    {
      traceId,
      error: error.message,
      stack: error.stack,
    },
    'Unexpected error occurred',
  );

  res.status(500).json(errorResponse);
}
