export class ApplicationError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string) {
    super('DATABASE_ERROR', message, 503);
  }
}

export class ReportGenerationError extends ApplicationError {
  constructor(message: string) {
    super('REPORT_GENERATION_ERROR', message, 500);
  }
}
