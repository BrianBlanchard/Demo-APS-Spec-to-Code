import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ResourceLockedError,
  InternalServerError,
} from '../src/types/error.types';

describe('Chunk 4: Exception / Error Handling', () => {
  describe('AppError Base Class', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.isOperational).toBe(true);
    });

    it('should default isOperational to true', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(500, 'SYSTEM_ERROR', 'System failure', false);
      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should extend Error correctly', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should handle validation messages', () => {
      const messages = [
        'Account ID must be 11 digits',
        'Amount must be positive',
        'Transaction type is required',
      ];

      messages.forEach((msg) => {
        const error = new ValidationError(msg);
        expect(error.message).toBe(msg);
      });
    });
  });

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError with 401 status code', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid token');
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when not provided', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Invalid JWT token');
      expect(error.message).toBe('Invalid JWT token');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status code', () => {
      const error = new NotFoundError('Account not found');

      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Account not found');
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when not provided', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });

    it('should handle specific resource not found messages', () => {
      const messages = [
        'Account 12345678901 not found',
        'Transaction not found',
        'User not found',
      ];

      messages.forEach((msg) => {
        const error = new NotFoundError(msg);
        expect(error.message).toBe(msg);
      });
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with 409 status code', () => {
      const error = new ConflictError('Insufficient credit');

      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
      expect(error.message).toBe('Insufficient credit');
      expect(error.isOperational).toBe(true);
    });

    it('should handle business rule conflict messages', () => {
      const error = new ConflictError(
        'Insufficient credit. Available: $2549.25, Requested: $3000.00'
      );
      expect(error.message).toContain('Insufficient credit');
      expect(error.message).toContain('Available');
      expect(error.message).toContain('Requested');
    });
  });

  describe('ResourceLockedError', () => {
    it('should create ResourceLockedError with 423 status code', () => {
      const error = new ResourceLockedError('Account is locked');

      expect(error.statusCode).toBe(423);
      expect(error.errorCode).toBe('RESOURCE_LOCKED');
      expect(error.message).toBe('Account is locked');
      expect(error.isOperational).toBe(true);
    });

    it('should use default message when not provided', () => {
      const error = new ResourceLockedError();
      expect(error.message).toBe('Resource is locked');
    });

    it('should handle specific lock messages', () => {
      const messages = [
        'Account is locked by another process',
        'Transaction in progress',
        'Database row locked',
      ];

      messages.forEach((msg) => {
        const error = new ResourceLockedError(msg);
        expect(error.message).toBe(msg);
      });
    });
  });

  describe('InternalServerError', () => {
    it('should create InternalServerError with 500 status code', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Database connection failed');
      expect(error.isOperational).toBe(false);
    });

    it('should use default message when not provided', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('Internal server error');
    });

    it('should mark as non-operational by default', () => {
      const error = new InternalServerError('System failure');
      expect(error.isOperational).toBe(false);
    });

    it('should handle system error messages', () => {
      const messages = [
        'Database connection failed',
        'Kafka producer error',
        'Redis connection lost',
      ];

      messages.forEach((msg) => {
        const error = new InternalServerError(msg);
        expect(error.message).toBe(msg);
        expect(error.isOperational).toBe(false);
      });
    });
  });

  describe('Error Type Discrimination', () => {
    it('should distinguish between different error types', () => {
      const errors = [
        new ValidationError('Validation failed'),
        new UnauthorizedError('Auth failed'),
        new NotFoundError('Not found'),
        new ConflictError('Conflict'),
        new ResourceLockedError('Locked'),
        new InternalServerError('Internal'),
      ];

      expect(errors[0]).toBeInstanceOf(ValidationError);
      expect(errors[1]).toBeInstanceOf(UnauthorizedError);
      expect(errors[2]).toBeInstanceOf(NotFoundError);
      expect(errors[3]).toBeInstanceOf(ConflictError);
      expect(errors[4]).toBeInstanceOf(ResourceLockedError);
      expect(errors[5]).toBeInstanceOf(InternalServerError);
    });

    it('should have unique error codes', () => {
      const errors = [
        new ValidationError('msg'),
        new UnauthorizedError('msg'),
        new NotFoundError('msg'),
        new ConflictError('msg'),
        new ResourceLockedError('msg'),
        new InternalServerError('msg'),
      ];

      const errorCodes = errors.map((e) => e.errorCode);
      const uniqueCodes = new Set(errorCodes);

      expect(uniqueCodes.size).toBe(errorCodes.length);
    });

    it('should have appropriate HTTP status codes', () => {
      expect(new ValidationError('msg').statusCode).toBe(400);
      expect(new UnauthorizedError('msg').statusCode).toBe(401);
      expect(new NotFoundError('msg').statusCode).toBe(404);
      expect(new ConflictError('msg').statusCode).toBe(409);
      expect(new ResourceLockedError('msg').statusCode).toBe(423);
      expect(new InternalServerError('msg').statusCode).toBe(500);
    });
  });

  describe('Error Response Interface', () => {
    it('should match expected error response structure', () => {
      const error = new ValidationError('Invalid input');

      const errorResponse = {
        errorCode: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        traceId: 'test-trace-id',
      };

      expect(errorResponse).toHaveProperty('errorCode');
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('timestamp');
      expect(errorResponse).toHaveProperty('traceId');
    });
  });
});
