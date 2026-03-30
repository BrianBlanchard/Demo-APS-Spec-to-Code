import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorResponse } from '../models/dtos';
import { logger } from '../config/logger';
import { getContext } from './context';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const context = getContext();
  const traceId = context?.traceId || 'unknown';

  // Log the error with context
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      traceId,
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  // Handle known application errors
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors (mask sensitive details)
  const errorResponse: ErrorResponse = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
};
