import { Request, Response, NextFunction } from 'express';
import { ApplicationError, ValidationError, UnprocessableEntityError } from '../errors/application-errors';
import { ErrorResponse } from '../types/dtos';
import { getTraceId } from '../context/request-context';
import logger from '../logger/logger';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  // Log the error
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      traceId,
    },
    'Request error occurred'
  );

  // Handle application errors
  if (error instanceof ApplicationError) {
    const errorResponse: ErrorResponse = {
      status: error.statusCode,
      error: error.name,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    // Add field-level errors for ValidationError
    if (error instanceof ValidationError && error.fields) {
      errorResponse.errors = error.fields;
    }

    // Add details for UnprocessableEntityError
    if (error instanceof UnprocessableEntityError && error.details) {
      Object.assign(errorResponse, error.details);
    }

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const errorResponse: ErrorResponse = {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
