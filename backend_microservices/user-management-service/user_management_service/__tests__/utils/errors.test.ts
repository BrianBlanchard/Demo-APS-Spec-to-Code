import {
  AppError,
  UserNotFoundError,
  UserAlreadySuspendedError,
  ValidationError,
  DatabaseError,
  UnauthorizedError,
} from '../../src/utils/errors';

describe('Utilities - Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('CUSTOM_ERROR', 'Custom error', 418);

      expect(error.errorCode).toBe('CUSTOM_ERROR');
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
    });

    it('should have stack trace', () => {
      const error = new AppError('TEST_ERROR', 'Test error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('AppError');
    });

    it('should be throwable and catchable', () => {
      const throwError = (): void => {
        throw new AppError('THROW_TEST', 'Thrown error');
      };

      expect(throwError).toThrow(AppError);
      expect(throwError).toThrow('Thrown error');
    });

    it('should preserve error properties when caught', () => {
      try {
        throw new AppError('CAUGHT_ERROR', 'This will be caught', 400);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.errorCode).toBe('CAUGHT_ERROR');
          expect(error.message).toBe('This will be caught');
          expect(error.statusCode).toBe(400);
        }
      }
    });
  });

  describe('UserNotFoundError', () => {
    it('should create error with correct properties', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new UserNotFoundError(userId);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UserNotFoundError);
      expect(error.errorCode).toBe('USER_NOT_FOUND');
      expect(error.message).toBe(`User with ID ${userId} not found`);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('UserNotFoundError');
    });

    it('should include userId in message', () => {
      const userId = 'test-user-id-999';
      const error = new UserNotFoundError(userId);

      expect(error.message).toContain(userId);
      expect(error.message).toContain('not found');
    });

    it('should be throwable', () => {
      const throwError = (): void => {
        throw new UserNotFoundError('user-123');
      };

      expect(throwError).toThrow(UserNotFoundError);
      expect(throwError).toThrow(/User with ID user-123 not found/);
    });
  });

  describe('UserAlreadySuspendedError', () => {
    it('should create error with correct properties', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const error = new UserAlreadySuspendedError(userId);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UserAlreadySuspendedError);
      expect(error.errorCode).toBe('USER_ALREADY_SUSPENDED');
      expect(error.message).toBe(`User with ID ${userId} is already suspended`);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('UserAlreadySuspendedError');
    });

    it('should include userId in message', () => {
      const userId = 'suspended-user-456';
      const error = new UserAlreadySuspendedError(userId);

      expect(error.message).toContain(userId);
      expect(error.message).toContain('already suspended');
    });

    it('should be throwable', () => {
      const throwError = (): void => {
        throw new UserAlreadySuspendedError('user-456');
      };

      expect(throwError).toThrow(UserAlreadySuspendedError);
      expect(throwError).toThrow(/is already suspended/);
    });
  });

  describe('ValidationError', () => {
    it('should create error with correct properties', () => {
      const error = new ValidationError('Invalid input data');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input data');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should handle detailed validation messages', () => {
      const detailedMessage =
        'suspension_notes: String must contain at least 1 character(s), duration_days: Expected number, received string';
      const error = new ValidationError(detailedMessage);

      expect(error.message).toBe(detailedMessage);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should be throwable', () => {
      const throwError = (): void => {
        throw new ValidationError('Validation failed');
      };

      expect(throwError).toThrow(ValidationError);
      expect(throwError).toThrow('Validation failed');
    });
  });

  describe('DatabaseError', () => {
    it('should create error with correct properties', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should handle various database error messages', () => {
      const messages = [
        'Connection timeout',
        'Query execution failed',
        'Transaction rollback error',
        'Constraint violation',
      ];

      messages.forEach((msg) => {
        const error = new DatabaseError(msg);
        expect(error.message).toBe(msg);
        expect(error.errorCode).toBe('DATABASE_ERROR');
        expect(error.statusCode).toBe(500);
      });
    });

    it('should be throwable', () => {
      const throwError = (): void => {
        throw new DatabaseError('Failed to execute query');
      };

      expect(throwError).toThrow(DatabaseError);
      expect(throwError).toThrow('Failed to execute query');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create error with custom message', () => {
      const customMessage = 'Invalid API key';
      const error = new UnauthorizedError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
    });

    it('should be throwable', () => {
      const throwError = (): void => {
        throw new UnauthorizedError('Token expired');
      };

      expect(throwError).toThrow(UnauthorizedError);
      expect(throwError).toThrow('Token expired');
    });
  });

  describe('Error Inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const errors = [
        new UserNotFoundError('user-1'),
        new UserAlreadySuspendedError('user-2'),
        new ValidationError('validation'),
        new DatabaseError('database'),
        new UnauthorizedError('unauthorized'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.statusCode).toBeDefined();
      });
    });

    it('should be distinguishable by instanceof', () => {
      const userNotFound = new UserNotFoundError('user-1');
      const validation = new ValidationError('invalid');
      const database = new DatabaseError('db error');

      expect(userNotFound instanceof UserNotFoundError).toBe(true);
      expect(userNotFound instanceof ValidationError).toBe(false);
      expect(userNotFound instanceof DatabaseError).toBe(false);

      expect(validation instanceof ValidationError).toBe(true);
      expect(validation instanceof UserNotFoundError).toBe(false);

      expect(database instanceof DatabaseError).toBe(true);
      expect(database instanceof ValidationError).toBe(false);
    });
  });

  describe('Error Status Codes', () => {
    it('should have correct HTTP status codes', () => {
      expect(new UserNotFoundError('user-1').statusCode).toBe(404);
      expect(new UserAlreadySuspendedError('user-2').statusCode).toBe(400);
      expect(new ValidationError('validation').statusCode).toBe(400);
      expect(new DatabaseError('database').statusCode).toBe(500);
      expect(new UnauthorizedError().statusCode).toBe(401);
    });

    it('should allow custom status codes for AppError', () => {
      const error = new AppError('CUSTOM', 'Custom error', 418);
      expect(error.statusCode).toBe(418);
    });
  });

  describe('Error Messages', () => {
    it('should have descriptive error messages', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const userNotFound = new UserNotFoundError(userId);
      expect(userNotFound.message).toContain('User with ID');
      expect(userNotFound.message).toContain(userId);
      expect(userNotFound.message).toContain('not found');

      const alreadySuspended = new UserAlreadySuspendedError(userId);
      expect(alreadySuspended.message).toContain('User with ID');
      expect(alreadySuspended.message).toContain(userId);
      expect(alreadySuspended.message).toContain('already suspended');
    });

    it('should preserve custom messages', () => {
      const customMessages = ['Test error 1', 'Test error 2', 'Test error 3'];

      customMessages.forEach((msg) => {
        const error = new AppError('TEST', msg);
        expect(error.message).toBe(msg);
      });
    });
  });
});
