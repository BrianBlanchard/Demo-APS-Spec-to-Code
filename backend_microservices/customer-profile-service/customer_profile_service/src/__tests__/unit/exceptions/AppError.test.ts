import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
} from '../../../exceptions/AppError';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message', { field1: 'error1' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ field1: 'error1' });
      expect(error.name).toBe('AppError');
    });

    it('should create error without details', () => {
      const error = new AppError(500, 'ERROR_CODE', 'Error message');

      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('ERROR_CODE');
      expect(error.message).toBe('Error message');
      expect(error.details).toBeUndefined();
    });

    it('should have stack trace', () => {
      const error = new AppError(400, 'ERROR_CODE', 'Error message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new AppError(400, 'ERROR', 'Test error');
      }).toThrow(AppError);
    });

    it('should be catchable as Error', () => {
      try {
        throw new AppError(400, 'ERROR', 'Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      }
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with default properties', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error with details', () => {
      const details = {
        email: 'Invalid email format',
        phone: 'Phone number required',
      };
      const error = new ValidationError('Validation failed', details);

      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new ValidationError('Test');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400);
        }
      }
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    it('should not have details property', () => {
      const error = new UnauthorizedError();
      expect(error.details).toBeUndefined();
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Insufficient privileges');

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient privileges');
    });

    it('should be catchable as AppError', () => {
      try {
        throw new ForbiddenError('Test');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create not found error with custom message', () => {
      const error = new NotFoundError('Customer 123456789 not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Customer 123456789 not found');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new NotFoundError('Test');
      }).toThrow(NotFoundError);
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with default message', () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
      expect(error.message).toBe('Conflict');
      expect(error.name).toBe('ConflictError');
    });

    it('should create conflict error with custom message', () => {
      const error = new ConflictError('Customer data was modified by another user');

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Customer data was modified by another user');
    });

    it('should be usable for optimistic locking scenarios', () => {
      const error = new ConflictError('Optimistic lock failure');

      expect(error).toBeInstanceOf(ConflictError);
      expect(error.statusCode).toBe(409);
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create unprocessable entity error', () => {
      const error = new UnprocessableEntityError('State/ZIP mismatch');

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.message).toBe('State/ZIP mismatch');
      expect(error.name).toBe('UnprocessableEntityError');
    });

    it('should create unprocessable entity error with details', () => {
      const details = {
        state: 'IL',
        zipCode: '90210',
        expectedPrefixes: '60, 61, 62',
      };
      const error = new UnprocessableEntityError('ZIP code does not match state', details);

      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual(details);
    });

    it('should be usable for business rule violations', () => {
      const error = new UnprocessableEntityError('Phone validation failure');

      expect(error).toBeInstanceOf(UnprocessableEntityError);
      expect(error.statusCode).toBe(422);
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('InternalServerError');
    });

    it('should create internal server error with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
    });

    it('should be usable for unexpected errors', () => {
      const error = new InternalServerError('Unexpected error occurred');

      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error Hierarchy', () => {
    it('should maintain correct inheritance chain', () => {
      const errors = [
        new ValidationError('test'),
        new UnauthorizedError('test'),
        new ForbiddenError('test'),
        new NotFoundError('test'),
        new ConflictError('test'),
        new UnprocessableEntityError('test'),
        new InternalServerError('test'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      });
    });

    it('should be distinguishable by instanceof', () => {
      const validationError = new ValidationError('test');
      const notFoundError = new NotFoundError('test');

      expect(validationError).toBeInstanceOf(ValidationError);
      expect(validationError).not.toBeInstanceOf(NotFoundError);
      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(notFoundError).not.toBeInstanceOf(ValidationError);
    });

    it('should have unique error codes', () => {
      const errors = [
        new ValidationError('test'),
        new UnauthorizedError('test'),
        new ForbiddenError('test'),
        new NotFoundError('test'),
        new ConflictError('test'),
        new UnprocessableEntityError('test'),
        new InternalServerError('test'),
      ];

      const errorCodes = errors.map((e) => e.errorCode);
      const uniqueErrorCodes = new Set(errorCodes);

      expect(uniqueErrorCodes.size).toBe(errorCodes.length);
    });

    it('should have correct HTTP status codes', () => {
      const statusMappings = [
        { error: new ValidationError('test'), expectedStatus: 400 },
        { error: new UnauthorizedError('test'), expectedStatus: 401 },
        { error: new ForbiddenError('test'), expectedStatus: 403 },
        { error: new NotFoundError('test'), expectedStatus: 404 },
        { error: new ConflictError('test'), expectedStatus: 409 },
        { error: new UnprocessableEntityError('test'), expectedStatus: 422 },
        { error: new InternalServerError('test'), expectedStatus: 500 },
      ];

      statusMappings.forEach(({ error, expectedStatus }) => {
        expect(error.statusCode).toBe(expectedStatus);
      });
    });
  });

  describe('Error Usage Scenarios', () => {
    it('should handle validation errors with field-level details', () => {
      const details = {
        customerId: 'Must be 9 digits',
        phone: 'Invalid format',
        zipCode: 'Required field',
      };

      const error = new ValidationError('Multiple validation errors', details);

      expect(error.details).toBeDefined();
      expect(Object.keys(error.details!)).toHaveLength(3);
      expect(error.details!.customerId).toBe('Must be 9 digits');
    });

    it('should handle unauthorized access attempts', () => {
      const error = new UnauthorizedError('JWT token expired');

      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('expired');
    });

    it('should handle forbidden operations', () => {
      const error = new ForbiddenError('CUSTOMER role cannot update FICO score');

      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('cannot update');
    });

    it('should handle resource not found scenarios', () => {
      const customerId = '123456789';
      const error = new NotFoundError(`Customer ${customerId} not found`);

      expect(error.statusCode).toBe(404);
      expect(error.message).toContain(customerId);
    });

    it('should handle optimistic locking conflicts', () => {
      const error = new ConflictError('Customer data was modified by another user');

      expect(error.statusCode).toBe(409);
      expect(error.message).toContain('modified by another user');
    });

    it('should handle business rule violations', () => {
      const details = {
        state: 'IL',
        zipCode: '90210',
        expectedPrefixes: '60, 61, 62',
      };

      const error = new UnprocessableEntityError(
        'ZIP code 90210 does not match state IL',
        details
      );

      expect(error.statusCode).toBe(422);
      expect(error.details?.state).toBe('IL');
    });

    it('should handle internal server errors', () => {
      const error = new InternalServerError('Database connection pool exhausted');

      expect(error.statusCode).toBe(500);
      expect(error.message).toContain('Database');
    });
  });

  describe('Error Serialization', () => {
    it('should be JSON serializable', () => {
      const error = new ValidationError('Test error', { field: 'value' });

      const json = JSON.stringify({
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        message: error.message,
        details: error.details,
      });

      const parsed = JSON.parse(json);

      expect(parsed.statusCode).toBe(400);
      expect(parsed.errorCode).toBe('VALIDATION_ERROR');
      expect(parsed.message).toBe('Test error');
      expect(parsed.details).toEqual({ field: 'value' });
    });

    it('should preserve properties for error responses', () => {
      const error = new UnprocessableEntityError('Test', { field1: 'error1' });

      const response = {
        errorCode: error.errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        details: error.details,
      };

      expect(response.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(response.message).toBe('Test');
      expect(response.details).toEqual({ field1: 'error1' });
    });
  });

  describe('Error Comparison', () => {
    it('should allow error type checking', () => {
      const error: Error = new NotFoundError('test');

      if (error instanceof AppError) {
        expect(error.statusCode).toBeDefined();
        expect(error.errorCode).toBeDefined();
      }

      if (error instanceof NotFoundError) {
        expect(error.statusCode).toBe(404);
      }
    });

    it('should support switch-case on error codes', () => {
      const error = new ValidationError('test');

      let handled = false;
      switch (error.errorCode) {
        case 'VALIDATION_ERROR':
          handled = true;
          break;
        case 'NOT_FOUND':
          handled = false;
          break;
      }

      expect(handled).toBe(true);
    });
  });
});
