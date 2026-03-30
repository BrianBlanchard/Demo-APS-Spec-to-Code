export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationNotFoundError extends AppError {
  constructor(validationId: string) {
    super(404, 'VALIDATION_NOT_FOUND', `Validation record not found: ${validationId}`);
  }
}

export class AuthorizationMismatchError extends AppError {
  constructor() {
    super(400, 'AUTHORIZATION_MISMATCH', 'Authorization code does not match validation record');
  }
}

export class AccountInactiveError extends AppError {
  constructor(accountId: string) {
    super(409, 'ACCOUNT_INACTIVE', `Account is not active: ${accountId}`);
  }
}

export class CardInactiveError extends AppError {
  constructor(cardNumber: string) {
    super(409, 'CARD_INACTIVE', `Card is not active: ${cardNumber}`);
  }
}

export class AmountMismatchError extends AppError {
  constructor() {
    super(422, 'AMOUNT_MISMATCH', 'Transaction amount does not match validated amount');
  }
}

export class DuplicateTransactionError extends AppError {
  constructor(validationId: string, existingTransactionId: string) {
    super(
      409,
      'DUPLICATE_TRANSACTION',
      `Transaction already posted for validation ${validationId}: ${existingTransactionId}`,
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, 'UNAUTHORIZED', 'Invalid service token');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, 'DATABASE_ERROR', `Database operation failed: ${message}`);
  }
}

export class TransactionIdGenerationError extends AppError {
  constructor() {
    super(500, 'TRANSACTION_ID_GENERATION_ERROR', 'Failed to generate unique transaction ID');
  }
}
