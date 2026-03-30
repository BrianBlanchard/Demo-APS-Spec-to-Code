import { Request, Response, NextFunction } from 'express';
import { AppError } from '../models/errors';
import { ErrorResponse } from '../models/dtos';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const traceId = req.traceId || 'unknown';

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logger.warn({ error, traceId }, 'Validation error');

    const errorResponse: ErrorResponse = {
      status: 400,
      error: 'Validation Error',
      message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    logger.warn({ error, traceId, details: error.details }, 'Application error');

    const errorResponse: ErrorResponse = {
      status: error.statusCode,
      error: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
      ...error.details,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle unexpected errors
  logger.error({ error, traceId }, 'Unexpected error');

  // Mask sensitive information in stack traces
  const errorResponse: ErrorResponse = {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
};
