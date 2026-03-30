// Custom error classes for domain-specific exceptions

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(422, 'UNPROCESSABLE_ENTITY', message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(503, 'SERVICE_UNAVAILABLE', message, details);
  }
}
