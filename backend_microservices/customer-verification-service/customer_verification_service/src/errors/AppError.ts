export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR') {
    super(400, errorCode, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode: string = 'NOT_FOUND') {
    super(404, errorCode, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, errorCode: string = 'UNAUTHORIZED') {
    super(401, errorCode, message);
  }
}

export class VerificationFailedError extends AppError {
  constructor(message: string, errorCode: string = 'VERIFICATION_FAILED') {
    super(422, errorCode, message);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, errorCode: string = 'EXTERNAL_SERVICE_ERROR') {
    super(503, errorCode, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, errorCode: string = 'INTERNAL_SERVER_ERROR') {
    super(500, errorCode, message);
  }
}
