import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../utils/errors.util';
import { ErrorResponse } from '../types/error.types';
import { getTraceId } from '../utils/context.util';
import { logger } from '../config/logger.config';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = getTraceId();

  let errorResponse: ErrorResponse;

  if (error instanceof ApplicationError) {
    errorResponse = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
      details: error.details,
    };

    logger.error(
      {
        traceId,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
      },
      error.message
    );

    res.status(error.statusCode).json(errorResponse);
  } else if (error instanceof ZodError) {
    errorResponse = {
      errorCode: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      timestamp: new Date().toISOString(),
      traceId,
      details: error.errors,
    };

    logger.error(
      {
        traceId,
        errorCode: 'VALIDATION_ERROR',
        statusCode: 400,
        path: req.path,
        method: req.method,
        validationErrors: error.errors,
      },
      'Request validation failed'
    );

    res.status(400).json(errorResponse);
  } else {
    errorResponse = {
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      traceId,
    };

    logger.error(
      {
        traceId,
        errorCode: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        path: req.path,
        method: req.method,
        error: error.message,
        stack: error.stack,
      },
      'Internal server error'
    );

    res.status(500).json(errorResponse);
  }
};
