import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/exceptions';
import { ErrorResponseDto } from '../types/error-response.dto';
import { logger } from '../utils/logger';
import { getTraceId } from '../utils/request-context';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = getTraceId();
  const timestamp = new Date().toISOString();

  // Log the error
  logger.error(
    {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      traceId,
      path: req.path,
      method: req.method,
    },
    'Error occurred'
  );

  // Build error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
  }

  const errorResponse: ErrorResponseDto = {
    errorCode,
    message,
    timestamp,
    traceId,
  };

  res.status(statusCode).json(errorResponse);
};
