import {
  AppError,
  ValidationError,
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
  ServiceUnavailableError,
} from '../../src/models/errors';

describe('Error Models', () => {
  describe('AppError', () => {
    it('should create error with status code and error code', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
    });

    it('should include optional details', () => {
      const details = { field: 'accountId', value: '12345' };
      const error = new AppError(400, 'TEST_ERROR', 'Test message', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new AppError(500, 'ERROR', 'Message');

      expect(error.name).toBe('AppError');
    });

    it('should capture stack trace', () => {
      const error = new AppError(500, 'ERROR', 'Message');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new AppError(500, 'ERROR', 'Test');
      }).toThrow(AppError);
    });

    it('should preserve error message when thrown', () => {
      try {
        throw new AppError(404, 'NOT_FOUND', 'Resource not found');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Resource not found');
      }
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    it('should include validation details', () => {
      const details = { field: 'calculationDate', reason: 'Future date not allowed' };
      const error = new ValidationError('Invalid date', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new ValidationError('Test');

      expect(error.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('Account not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Account not found');
    });

    it('should include resource details', () => {
      const details = { accountId: '12345678901' };
      const error = new NotFoundError('Account does not exist', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new NotFoundError('Test');

      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create unprocessable entity error with 422 status', () => {
      const error = new UnprocessableEntityError('Cannot process request');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnprocessableEntityError);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.message).toBe('Cannot process request');
    });

    it('should include business rule violation details', () => {
      const details = {
        accountStatus: 'CLOSED',
        reason: 'Cannot calculate interest for closed account',
      };
      const error = new UnprocessableEntityError('Account closed', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new UnprocessableEntityError('Test');

      expect(error.name).toBe('UnprocessableEntityError');
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with 500 status', () => {
      const error = new InternalServerError('Unexpected error occurred');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Unexpected error occurred');
    });

    it('should include error details', () => {
      const details = { originalError: 'Database connection failed' };
      const error = new InternalServerError('Server error', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new InternalServerError('Test');

      expect(error.name).toBe('InternalServerError');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with 503 status', () => {
      const error = new ServiceUnavailableError('Service down');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ServiceUnavailableError);
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('Service down');
    });

    it('should include service details', () => {
      const details = { service: 'interest-rate-service', retryAfter: 30 };
      const error = new ServiceUnavailableError('External service unavailable', details);

      expect(error.details).toEqual(details);
    });

    it('should have correct name property', () => {
      const error = new ServiceUnavailableError('Test');

      expect(error.name).toBe('ServiceUnavailableError');
    });
  });

  describe('Error Hierarchy', () => {
    it('should maintain instanceof relationships', () => {
      const validation = new ValidationError('Test');
      const notFound = new NotFoundError('Test');
      const unprocessable = new UnprocessableEntityError('Test');
      const internal = new InternalServerError('Test');
      const unavailable = new ServiceUnavailableError('Test');

      expect(validation).toBeInstanceOf(AppError);
      expect(notFound).toBeInstanceOf(AppError);
      expect(unprocessable).toBeInstanceOf(AppError);
      expect(internal).toBeInstanceOf(AppError);
      expect(unavailable).toBeInstanceOf(AppError);

      expect(validation).toBeInstanceOf(Error);
      expect(notFound).toBeInstanceOf(Error);
    });

    it('should be distinguishable by instanceof', () => {
      const error1 = new ValidationError('Test');
      const error2 = new NotFoundError('Test');

      expect(error1).not.toBeInstanceOf(NotFoundError);
      expect(error2).not.toBeInstanceOf(ValidationError);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new NotFoundError('Test');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('Error Serialization', () => {
    it('should include all properties in error object', () => {
      const error = new ValidationError('Invalid input', { field: 'test' });

      expect(error.statusCode).toBeDefined();
      expect(error.errorCode).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.details).toBeDefined();
      expect(error.name).toBeDefined();
    });

    it('should have serializable details', () => {
      const details = { accountId: '12345', status: 'CLOSED' };
      const error = new UnprocessableEntityError('Test', details);

      const serialized = JSON.stringify(error.details);
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual(details);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const error = new ValidationError('');

      expect(error.message).toBe('');
    });

    it('should handle undefined details', () => {
      const error = new NotFoundError('Test');

      expect(error.details).toBeUndefined();
    });

    it('should handle complex nested details', () => {
      const details = {
        validation: {
          fields: ['field1', 'field2'],
          errors: [{ field: 'field1', message: 'Required' }],
        },
      };
      const error = new ValidationError('Multiple errors', details);

      expect(error.details).toEqual(details);
    });

    it('should preserve stack trace information', () => {
      function throwError(): void {
        throw new InternalServerError('Test error');
      }

      try {
        throwError();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerError);
        expect((error as InternalServerError).stack).toContain('throwError');
      }
    });
  });
});
