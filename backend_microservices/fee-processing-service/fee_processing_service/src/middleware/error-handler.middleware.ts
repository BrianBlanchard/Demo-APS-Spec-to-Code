import { Request, Response, NextFunction } from 'express';
import { ErrorResponseDto } from '../dtos/error-response.dto';
import { getTraceId } from '../utils/request-context';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(422, 'BUSINESS_ERROR', message);
    this.name = 'BusinessError';
  }
}

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const traceId = getTraceId();

  logger.error(
    {
      err,
      traceId,
      path: req.path,
      method: req.method,
    },
    'Error occurred'
  );

  if (err instanceof ZodError) {
    const errorResponse: ErrorResponseDto = {
      errorCode: 'VALIDATION_ERROR',
      message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      timestamp: new Date().toISOString(),
      traceId,
    };
    res.status(400).json(errorResponse);
    return;
  }

  if (err instanceof AppError) {
    const errorResponse: ErrorResponseDto = {
      errorCode: err.errorCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId,
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  const errorResponse: ErrorResponseDto = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
