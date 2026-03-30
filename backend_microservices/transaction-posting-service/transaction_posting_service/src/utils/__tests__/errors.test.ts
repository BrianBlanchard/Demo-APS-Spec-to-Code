import {
  AppError,
  ValidationNotFoundError,
  AuthorizationMismatchError,
  AccountInactiveError,
  CardInactiveError,
  AmountMismatchError,
  DuplicateTransactionError,
  UnauthorizedError,
  DatabaseError,
  TransactionIdGenerationError,
} from '../errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('should create error with status code, error code, and message', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
    });

    it('should be instance of Error', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error.name).toBe('AppError');
    });

    it('should have stack trace', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationNotFoundError', () => {
    it('should create error with 404 status code', () => {
      const error = new ValidationNotFoundError('VAL-123');
      expect(error.statusCode).toBe(404);
    });

    it('should have VALIDATION_NOT_FOUND error code', () => {
      const error = new ValidationNotFoundError('VAL-123');
      expect(error.errorCode).toBe('VALIDATION_NOT_FOUND');
    });

    it('should include validation ID in message', () => {
      const error = new ValidationNotFoundError('VAL-123');
      expect(error.message).toContain('VAL-123');
    });

    it('should be instance of AppError', () => {
      const error = new ValidationNotFoundError('VAL-123');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AuthorizationMismatchError', () => {
    it('should create error with 400 status code', () => {
      const error = new AuthorizationMismatchError();
      expect(error.statusCode).toBe(400);
    });

    it('should have AUTHORIZATION_MISMATCH error code', () => {
      const error = new AuthorizationMismatchError();
      expect(error.errorCode).toBe('AUTHORIZATION_MISMATCH');
    });

    it('should have appropriate message', () => {
      const error = new AuthorizationMismatchError();
      expect(error.message).toBe('Authorization code does not match validation record');
    });

    it('should be instance of AppError', () => {
      const error = new AuthorizationMismatchError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AccountInactiveError', () => {
    it('should create error with 409 status code', () => {
      const error = new AccountInactiveError('ACC-123');
      expect(error.statusCode).toBe(409);
    });

    it('should have ACCOUNT_INACTIVE error code', () => {
      const error = new AccountInactiveError('ACC-123');
      expect(error.errorCode).toBe('ACCOUNT_INACTIVE');
    });

    it('should include account ID in message', () => {
      const error = new AccountInactiveError('ACC-123');
      expect(error.message).toContain('ACC-123');
    });

    it('should be instance of AppError', () => {
      const error = new AccountInactiveError('ACC-123');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('CardInactiveError', () => {
    it('should create error with 409 status code', () => {
      const error = new CardInactiveError('4532123456781234');
      expect(error.statusCode).toBe(409);
    });

    it('should have CARD_INACTIVE error code', () => {
      const error = new CardInactiveError('4532123456781234');
      expect(error.errorCode).toBe('CARD_INACTIVE');
    });

    it('should include card number in message', () => {
      const error = new CardInactiveError('4532123456781234');
      expect(error.message).toContain('4532123456781234');
    });

    it('should be instance of AppError', () => {
      const error = new CardInactiveError('4532123456781234');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AmountMismatchError', () => {
    it('should create error with 422 status code', () => {
      const error = new AmountMismatchError();
      expect(error.statusCode).toBe(422);
    });

    it('should have AMOUNT_MISMATCH error code', () => {
      const error = new AmountMismatchError();
      expect(error.errorCode).toBe('AMOUNT_MISMATCH');
    });

    it('should have appropriate message', () => {
      const error = new AmountMismatchError();
      expect(error.message).toBe('Transaction amount does not match validated amount');
    });

    it('should be instance of AppError', () => {
      const error = new AmountMismatchError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('DuplicateTransactionError', () => {
    it('should create error with 409 status code', () => {
      const error = new DuplicateTransactionError('VAL-123', 'TXN-456');
      expect(error.statusCode).toBe(409);
    });

    it('should have DUPLICATE_TRANSACTION error code', () => {
      const error = new DuplicateTransactionError('VAL-123', 'TXN-456');
      expect(error.errorCode).toBe('DUPLICATE_TRANSACTION');
    });

    it('should include validation ID and transaction ID in message', () => {
      const error = new DuplicateTransactionError('VAL-123', 'TXN-456');
      expect(error.message).toContain('VAL-123');
      expect(error.message).toContain('TXN-456');
    });

    it('should be instance of AppError', () => {
      const error = new DuplicateTransactionError('VAL-123', 'TXN-456');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with 401 status code', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
    });

    it('should have UNAUTHORIZED error code', () => {
      const error = new UnauthorizedError();
      expect(error.errorCode).toBe('UNAUTHORIZED');
    });

    it('should have appropriate message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Invalid service token');
    });

    it('should be instance of AppError', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('DatabaseError', () => {
    it('should create error with 500 status code', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.statusCode).toBe(500);
    });

    it('should have DATABASE_ERROR error code', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.errorCode).toBe('DATABASE_ERROR');
    });

    it('should include original error message', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.message).toContain('Connection failed');
    });

    it('should prefix message with context', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.message).toContain('Database operation failed');
    });

    it('should be instance of AppError', () => {
      const error = new DatabaseError('Connection failed');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('TransactionIdGenerationError', () => {
    it('should create error with 500 status code', () => {
      const error = new TransactionIdGenerationError();
      expect(error.statusCode).toBe(500);
    });

    it('should have TRANSACTION_ID_GENERATION_ERROR error code', () => {
      const error = new TransactionIdGenerationError();
      expect(error.errorCode).toBe('TRANSACTION_ID_GENERATION_ERROR');
    });

    it('should have appropriate message', () => {
      const error = new TransactionIdGenerationError();
      expect(error.message).toBe('Failed to generate unique transaction ID');
    });

    it('should be instance of AppError', () => {
      const error = new TransactionIdGenerationError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('Error Hierarchy', () => {
    it('all custom errors should be instances of AppError', () => {
      const errors = [
        new ValidationNotFoundError('VAL-123'),
        new AuthorizationMismatchError(),
        new AccountInactiveError('ACC-123'),
        new CardInactiveError('4532123456781234'),
        new AmountMismatchError(),
        new DuplicateTransactionError('VAL-123', 'TXN-456'),
        new UnauthorizedError(),
        new DatabaseError('Test'),
        new TransactionIdGenerationError(),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should have unique error codes', () => {
      const errorCodes = [
        new ValidationNotFoundError('VAL-123').errorCode,
        new AuthorizationMismatchError().errorCode,
        new AccountInactiveError('ACC-123').errorCode,
        new CardInactiveError('4532123456781234').errorCode,
        new AmountMismatchError().errorCode,
        new DuplicateTransactionError('VAL-123', 'TXN-456').errorCode,
        new UnauthorizedError().errorCode,
        new DatabaseError('Test').errorCode,
        new TransactionIdGenerationError().errorCode,
      ];

      const uniqueCodes = new Set(errorCodes);
      expect(uniqueCodes.size).toBe(errorCodes.length);
    });
  });
});
