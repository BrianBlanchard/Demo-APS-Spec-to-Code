import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { ErrorResponseDto } from '../dtos/error-response.dto';
import { getRequestContext } from './trace-context.middleware';
import { logger } from '../infrastructure/logger';

export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const context = getRequestContext();
  const traceId = context?.traceId || 'unknown';

  if (error instanceof BaseException) {
    logger.error(
      {
        errorCode: error.errorCode,
        message: error.message,
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
      },
      'Application error'
    );

    const errorResponse: ErrorResponseDto = {
      errorCode: error.errorCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Unknown error - mask details
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    },
    'Unexpected error'
  );

  const errorResponse: ErrorResponseDto = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
}
