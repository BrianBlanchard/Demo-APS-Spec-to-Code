import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/custom-errors';
import { ErrorResponse } from '../dto/email-notification.dto';
import { logger } from '../config/logger.config';
import { getTraceId } from '../utils/async-local-storage';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  if (err instanceof AppError) {
    logger.error(
      {
        err,
        traceId,
        path: req.path,
        method: req.method,
        errorCode: err.errorCode,
      },
      'Application error occurred'
    );

    const errorResponse: ErrorResponse = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  logger.error(
    {
      err,
      traceId,
      path: req.path,
      method: req.method,
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
