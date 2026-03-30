import { Request, Response, NextFunction } from 'express';
import { AppError, InternalServerError } from '../types/error.types';
import { logger } from '../utils/logger';
import { asyncLocalStorage } from '../utils/async-context';
import { ErrorResponse } from '../types/error.types';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const context = asyncLocalStorage.getStore();
  const traceId = context?.traceId || 'unknown';

  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else {
    appError = new InternalServerError(err.message || 'An unexpected error occurred');
  }

  logger.error(
    {
      err: {
        message: appError.message,
        statusCode: appError.statusCode,
        errorCode: appError.errorCode,
        stack: appError.isOperational ? undefined : appError.stack,
      },
      traceId,
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  const errorResponse: ErrorResponse = {
    errorCode: appError.errorCode,
    message: appError.message,
    timestamp: new Date().toISOString(),
    traceId,
  };

  if (appError.statusCode === 423) {
    res.setHeader('Retry-After', '5');
  }

  res.status(appError.statusCode).json(errorResponse);
};
