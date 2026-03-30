/**
 * Custom error classes for the User Management Service
 */

export class AppError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends AppError {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User with ID ${userId} not found`, 404);
  }
}

export class UserAlreadySuspendedError extends AppError {
  constructor(userId: string) {
    super('USER_ALREADY_SUSPENDED', `User with ID ${userId} is already suspended`, 400);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super('DATABASE_ERROR', message, 500);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super('UNAUTHORIZED', message, 401);
  }
}
