import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '../utils/errors';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { getTraceId } from '../utils/async-context';
import logger from '../utils/logger';

export function errorMiddleware(
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
    },
    'Request failed with error'
  );

  // Determine status code and error code
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (error instanceof ApplicationError) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
  }

  // Create error response
  const errorResponse: ErrorResponseDto = {
    errorCode,
    message: sanitizeErrorMessage(error.message),
    timestamp: new Date().toISOString(),
    traceId,
  };

  res.status(statusCode).json(errorResponse);
}

function sanitizeErrorMessage(message: string): string {
  // Remove sensitive information from error messages
  const sensitivePatterns = [
    /password[:\s]*.+/gi,
    /token[:\s]*.+/gi,
    /secret[:\s]*.+/gi,
    /key[:\s]*.+/gi,
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}
