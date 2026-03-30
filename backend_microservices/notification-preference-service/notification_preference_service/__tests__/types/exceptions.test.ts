import {
  AppError,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from '../../src/types/exceptions';

describe('Exceptions', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('TEST_ERROR', 'Test error message', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should default to 500 status code', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');

      expect(error.statusCode).toBe(500);
    });

    it('should have stack trace', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new AppError('TEST_ERROR', 'Test error message');
      }).toThrow(AppError);
    });

    it('should be catchable as Error', () => {
      try {
        throw new AppError('TEST_ERROR', 'Test error message');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should preserve error message', () => {
      const errorMessage = 'Detailed error message';
      const error = new AppError('TEST_ERROR', errorMessage);

      expect(error.message).toBe(errorMessage);
      expect(error.toString()).toContain(errorMessage);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with custom message', () => {
      const error = new NotFoundError('Customer not found');

      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Customer not found');
      expect(error.statusCode).toBe(404);
    });

    it('should have 404 status code', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
    });

    it('should be throwable', () => {
      expect(() => {
        throw new NotFoundError('Customer not found');
      }).toThrow(NotFoundError);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new NotFoundError('Resource missing');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.errorCode).toBe('NOT_FOUND');
        }
      }
    });
  });

  describe('ValidationError', () => {
    it('should create error with default message', () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should create error with custom message', () => {
      const error = new ValidationError('Invalid email format');

      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid email format');
      expect(error.statusCode).toBe(400);
    });

    it('should have 400 status code', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
    });

    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Invalid input');
      }).toThrow(ValidationError);
    });

    it('should handle complex validation messages', () => {
      const message = 'transactionAlerts.threshold: must be non-negative';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new ValidationError('Validation failed');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400);
          expect(error.errorCode).toBe('VALIDATION_ERROR');
        }
      }
    });
  });

  describe('DatabaseError', () => {
    it('should create error with default message', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with custom message', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(500);
    });

    it('should have 500 status code', () => {
      const error = new DatabaseError();
      expect(error.statusCode).toBe(500);
    });

    it('should be throwable', () => {
      expect(() => {
        throw new DatabaseError('Query failed');
      }).toThrow(DatabaseError);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new DatabaseError('Database connection failed');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.errorCode).toBe('DATABASE_ERROR');
        }
      }
    });
  });

  describe('Error hierarchy', () => {
    it('should maintain proper instanceof relationships', () => {
      const notFound = new NotFoundError();
      const validation = new ValidationError();
      const database = new DatabaseError();

      expect(notFound instanceof Error).toBe(true);
      expect(notFound instanceof AppError).toBe(true);
      expect(notFound instanceof NotFoundError).toBe(true);

      expect(validation instanceof Error).toBe(true);
      expect(validation instanceof AppError).toBe(true);
      expect(validation instanceof ValidationError).toBe(true);

      expect(database instanceof Error).toBe(true);
      expect(database instanceof AppError).toBe(true);
      expect(database instanceof DatabaseError).toBe(true);
    });

    it('should have distinct error types', () => {
      const notFound = new NotFoundError();
      const validation = new ValidationError();

      expect(notFound instanceof ValidationError).toBe(false);
      expect(validation instanceof NotFoundError).toBe(false);
    });

    it('should all extend AppError', () => {
      const errors = [
        new NotFoundError(),
        new ValidationError(),
        new DatabaseError(),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
      });
    });
  });
});
