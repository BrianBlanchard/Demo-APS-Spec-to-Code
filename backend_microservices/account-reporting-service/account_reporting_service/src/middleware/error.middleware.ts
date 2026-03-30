import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../errors/application.error';
import { ErrorResponseDto } from '../dtos/report.dto';
import { getTraceId } from '../utils/async-context';
import { createLogger } from '../utils/logger';
import { ZodError } from 'zod';

const logger = createLogger('ErrorMiddleware');

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      path: req.path,
      method: req.method,
    },
    'Request error occurred'
  );

  const traceId = getTraceId();
  const timestamp = new Date().toISOString();

  if (error instanceof ZodError) {
    const errorResponse: ErrorResponseDto = {
      errorCode: 'VALIDATION_ERROR',
      message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      timestamp,
      traceId,
    };
    res.status(400).json(errorResponse);
    return;
  }

  if (error instanceof ApplicationError) {
    const errorResponse: ErrorResponseDto = {
      errorCode: error.code,
      message: error.message,
      timestamp,
      traceId,
    };
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  const errorResponse: ErrorResponseDto = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
    traceId,
  };

  res.status(500).json(errorResponse);
}
