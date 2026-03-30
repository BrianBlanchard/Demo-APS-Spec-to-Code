import {
  ApplicationError,
  ValidationError,
  NotFoundError,
  UnprocessableEntityError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from '../application-errors';

describe('Application Errors', () => {
  describe('ApplicationError', () => {
    it('should create error with message and default status code', () => {
      const error = new ApplicationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApplicationError');
    });

    it('should create error with custom status code', () => {
      const error = new ApplicationError('Test error', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should create error with error code', () => {
      const error = new ApplicationError('Test error', 404, 'NOT_FOUND');
      expect(error.errorCode).toBe('NOT_FOUND');
    });

    it('should have stack trace', () => {
      const error = new ApplicationError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error with field errors', () => {
      const fields = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError('Validation failed', fields);
      expect(error.fields).toEqual(fields);
      expect(error.fields).toHaveLength(2);
    });

    it('should create validation error without field errors', () => {
      const error = new ValidationError('Validation failed');
      expect(error.fields).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with message', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create not found error with entity ID', () => {
      const error = new NotFoundError('Customer not found', 'CUS-123');
      expect(error.entityId).toBe('CUS-123');
    });

    it('should create not found error without entity ID', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.entityId).toBeUndefined();
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create unprocessable entity error with message', () => {
      const error = new UnprocessableEntityError('Cannot process request');
      expect(error.message).toBe('Cannot process request');
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.name).toBe('UnprocessableEntityError');
    });

    it('should create unprocessable entity error with details', () => {
      const details = { kycStatus: 'PENDING', customerId: 'CUS-123' };
      const error = new UnprocessableEntityError('KYC not verified', details);
      expect(error.details).toEqual(details);
    });

    it('should create unprocessable entity error without details', () => {
      const error = new UnprocessableEntityError('Cannot process');
      expect(error.details).toBeUndefined();
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with default message', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.name).toBe('InternalServerError');
    });

    it('should create internal server error with custom message', () => {
      const error = new InternalServerError('Database connection failed');
      expect(error.message).toBe('Database connection failed');
    });
  });

  describe('Error inheritance', () => {
    it('should be instance of Error', () => {
      const error = new ApplicationError('Test');
      expect(error instanceof Error).toBe(true);
    });

    it('should be instance of ApplicationError', () => {
      const error = new ValidationError('Test');
      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('Test error');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof ApplicationError).toBe(true);
        expect(error instanceof ValidationError).toBe(true);
      }
    });
  });

  describe('Error properties', () => {
    it('should have all required properties', () => {
      const error = new ValidationError('Test', [{ field: 'test', message: 'error' }]);
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('errorCode');
      expect(error).toHaveProperty('name');
      expect(error).toHaveProperty('stack');
      expect(error).toHaveProperty('fields');
    });
  });
});
