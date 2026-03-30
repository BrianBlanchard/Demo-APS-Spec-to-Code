import {
  ApplicationError,
  ValidationError,
  DatabaseError,
  BusinessLogicError,
  NotFoundError,
} from '../../src/utils/errors.util';

describe('Error Utilities', () => {
  describe('ApplicationError', () => {
    it('should create error with all properties', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500, { detail: 'info' });

      expect(error.message).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ detail: 'info' });
      expect(error.name).toBe('ApplicationError');
    });

    it('should default to 500 status code', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR');

      expect(error.statusCode).toBe(500);
    });

    it('should be instanceof Error', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof ApplicationError', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR');

      expect(error).toBeInstanceOf(ApplicationError);
    });

    it('should have stack trace', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApplicationError');
    });

    it('should handle undefined details', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR', 500);

      expect(error.details).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ValidationError('Invalid input', details);

      expect(error.details).toEqual(details);
    });

    it('should be instanceof ApplicationError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should be instanceof Error', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with 500 status code', () => {
      const error = new DatabaseError('Connection failed');

      expect(error.message).toBe('Connection failed');
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should include details when provided', () => {
      const details = { query: 'SELECT * FROM users', error: 'timeout' };
      const error = new DatabaseError('Query failed', details);

      expect(error.details).toEqual(details);
    });

    it('should be instanceof ApplicationError', () => {
      const error = new DatabaseError('Connection failed');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error with 422 status code', () => {
      const error = new BusinessLogicError('Insufficient funds', 'INSUFFICIENT_FUNDS');

      expect(error.message).toBe('Insufficient funds');
      expect(error.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(error.statusCode).toBe(422);
      expect(error.name).toBe('BusinessLogicError');
    });

    it('should allow custom error codes', () => {
      const error = new BusinessLogicError('Custom error', 'CUSTOM_CODE');

      expect(error.errorCode).toBe('CUSTOM_CODE');
    });

    it('should include details when provided', () => {
      const details = { accountId: '123', balance: 0 };
      const error = new BusinessLogicError('Insufficient funds', 'INSUFFICIENT_FUNDS', details);

      expect(error.details).toEqual(details);
    });

    it('should be instanceof ApplicationError', () => {
      const error = new BusinessLogicError('Business error', 'BUSINESS_ERROR');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(BusinessLogicError);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status code', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should include details when provided', () => {
      const details = { resourceId: '123', resourceType: 'Account' };
      const error = new NotFoundError('Account not found', details);

      expect(error.details).toEqual(details);
    });

    it('should be instanceof ApplicationError', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('Error inheritance and type checking', () => {
    it('should allow catching specific error types', () => {
      const thrower = (): void => {
        throw new ValidationError('Test validation error');
      };

      try {
        thrower();
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.statusCode).toBe(400);
        }
      }
    });

    it('should allow catching ApplicationError base class', () => {
      const thrower = (): void => {
        throw new DatabaseError('Test database error');
      };

      try {
        thrower();
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBeDefined();
          expect(error.statusCode).toBeDefined();
        }
      }
    });

    it('should preserve error properties through throw/catch', () => {
      const details = { key: 'value' };
      const thrower = (): void => {
        throw new BusinessLogicError('Test error', 'TEST_CODE', details);
      };

      try {
        thrower();
      } catch (error) {
        if (error instanceof BusinessLogicError) {
          expect(error.message).toBe('Test error');
          expect(error.errorCode).toBe('TEST_CODE');
          expect(error.details).toEqual(details);
          expect(error.statusCode).toBe(422);
        }
      }
    });
  });
});
