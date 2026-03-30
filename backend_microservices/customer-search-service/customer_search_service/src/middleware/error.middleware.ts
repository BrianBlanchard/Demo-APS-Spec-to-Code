import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/error.types';
import { getContext } from './context.middleware';
import { logger } from '../utils/logger';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const context = getContext();
  const traceId = context?.traceId || 'unknown';

  if (error instanceof AppError) {
    logger.error(
      {
        errorCode: error.errorCode,
        message: error.message,
        statusCode: error.statusCode,
        traceId,
      },
      'Application error occurred'
    );

    const errorResponse: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Unknown error
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      traceId,
    },
    'Unexpected error occurred'
  );

  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
