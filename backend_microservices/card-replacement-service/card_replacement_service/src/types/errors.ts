export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errorCode = 'VALIDATION_ERROR') {
    super(400, errorCode, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode = 'NOT_FOUND') {
    super(404, errorCode, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, errorCode = 'UNAUTHORIZED') {
    super(401, errorCode, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, errorCode = 'FORBIDDEN') {
    super(403, errorCode, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, errorCode = 'UNPROCESSABLE_ENTITY') {
    super(422, errorCode, message);
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(500, errorCode, message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
