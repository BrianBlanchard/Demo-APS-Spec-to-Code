export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message: string,
    public readonly fields?: Array<{ field: string; message: string }>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, public readonly entityId?: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnprocessableEntityError extends ApplicationError {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message, 422, 'UNPROCESSABLE_ENTITY');
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
