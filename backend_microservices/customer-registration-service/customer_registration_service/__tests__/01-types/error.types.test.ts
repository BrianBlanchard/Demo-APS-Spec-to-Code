import {
  ErrorResponse,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
} from '../../src/types/error.types';

describe('Error Types', () => {
  describe('ErrorResponse Interface', () => {
    it('should accept valid error response', () => {
      const errorResponse: ErrorResponse = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(errorResponse).toBeDefined();
      expect(errorResponse.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should accept error response with optional details', () => {
      const errorResponse: ErrorResponse = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        details: { field: 'ficoScore', reason: 'Out of range' },
      };

      expect(errorResponse.details).toBeDefined();
      expect(errorResponse.details?.field).toBe('ficoScore');
    });
  });

  describe('AppError Class', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with details', () => {
      const details = { field: 'test', value: 123 };
      const error = new AppError(400, 'TEST_ERROR', 'Test error', details);

      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error');

      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError Class', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should create ValidationError with details', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const error = new ValidationError('Invalid email', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('UnauthorizedError Class', () => {
    it('should create UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('ForbiddenError Class', () => {
    it('should create ForbiddenError with default message', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
    });
  });

  describe('ConflictError Class', () => {
    it('should create ConflictError with message', () => {
      const error = new ConflictError('Resource already exists');

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
      expect(error.message).toBe('Resource already exists');
      expect(error.name).toBe('ConflictError');
    });

    it('should create ConflictError with details', () => {
      const details = { existingId: '123456789' };
      const error = new ConflictError('Duplicate SSN', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('UnprocessableEntityError Class', () => {
    it('should create UnprocessableEntityError with message', () => {
      const error = new UnprocessableEntityError('Invalid SSN range');

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.message).toBe('Invalid SSN range');
      expect(error.name).toBe('UnprocessableEntityError');
    });

    it('should create UnprocessableEntityError with details', () => {
      const details = { field: 'ssn', rule: 'invalid_range' };
      const error = new UnprocessableEntityError('Invalid SSN', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('InternalServerError Class', () => {
    it('should create InternalServerError with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal Server Error');
      expect(error.name).toBe('InternalServerError');
    });

    it('should create InternalServerError with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
    });
  });
});
