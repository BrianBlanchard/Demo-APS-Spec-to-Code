import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../logging/logger';
import { ErrorResponseDto } from '../types/dtos';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = req.headers['x-trace-id'] as string || 'unknown';

  if (error instanceof AppError) {
    logger.error(
      {
        err: error,
        traceId,
        statusCode: error.statusCode,
        errorCode: error.errorCode,
      },
      `Application error: ${error.message}`
    );

    const errorResponse: ErrorResponseDto = {
      errorCode: error.errorCode,
      message: maskSensitiveData(error.message),
      timestamp: new Date().toISOString(),
      traceId,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  logger.error(
    {
      err: error,
      traceId,
    },
    `Unexpected error: ${error.message}`
  );

  const errorResponse: ErrorResponseDto = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(500).json(errorResponse);
};

const maskSensitiveData = (message: string): string => {
  return message
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
    .replace(/\b\d{9}\b/g, '*********');
};
