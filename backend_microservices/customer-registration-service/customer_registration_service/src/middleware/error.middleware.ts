import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/error.types';
import { logger, getTraceId } from '../config/logger.config';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = getTraceId() || 'unknown';

  // Log error
  logger.error(
    {
      error: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      traceId,
      method: req.method,
      path: req.path,
    },
    'Error occurred'
  );

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      timestamp: new Date().toISOString(),
      traceId,
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
      details: err.details,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    traceId,
  });
};
