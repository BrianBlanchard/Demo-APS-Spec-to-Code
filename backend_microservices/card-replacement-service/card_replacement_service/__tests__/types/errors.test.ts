import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  UnprocessableEntityError,
  InternalServerError,
} from '../../src/types/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with all parameters', () => {
      const error = new AppError(400, 'BAD_REQUEST', 'Invalid input', true);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });

    it('should default isOperational to true', () => {
      const error = new AppError(500, 'ERROR', 'Something went wrong');

      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(500, 'FATAL_ERROR', 'Critical failure', false);

      expect(error.isOperational).toBe(false);
    });

    it('should have Error prototype', () => {
      const error = new AppError(400, 'ERROR', 'Test');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });

    it('should capture stack trace', () => {
      const error = new AppError(400, 'ERROR', 'Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Test'); // Stack trace contains error message
    });

    it('should have correct name property', () => {
      const error = new AppError(400, 'ERROR', 'Test');

      expect(error.name).toBe('Error'); // Inherited from Error
    });
  });

  describe('ValidationError', () => {
    it('should create error with default error code', () => {
      const error = new ValidationError('Invalid field value');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid field value');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new ValidationError('Invalid email', 'INVALID_EMAIL');

      expect(error.errorCode).toBe('INVALID_EMAIL');
      expect(error.statusCode).toBe(400);
    });

    it('should always have 400 status code', () => {
      const error1 = new ValidationError('Error 1');
      const error2 = new ValidationError('Error 2', 'CUSTOM_CODE');

      expect(error1.statusCode).toBe(400);
      expect(error2.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with default error code', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new NotFoundError('Card not found', 'CARD_NOT_FOUND');

      expect(error.errorCode).toBe('CARD_NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('should always have 404 status code', () => {
      const error1 = new NotFoundError('User not found');
      const error2 = new NotFoundError('Order not found', 'ORDER_NOT_FOUND');

      expect(error1.statusCode).toBe(404);
      expect(error2.statusCode).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with default error code', () => {
      const error = new UnauthorizedError('Authentication required');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Authentication required');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new UnauthorizedError('Invalid token', 'INVALID_TOKEN');

      expect(error.errorCode).toBe('INVALID_TOKEN');
      expect(error.statusCode).toBe(401);
    });

    it('should always have 401 status code', () => {
      const error1 = new UnauthorizedError('No token provided');
      const error2 = new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');

      expect(error1.statusCode).toBe(401);
      expect(error2.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with default error code', () => {
      const error = new ForbiddenError('Access denied');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');

      expect(error.errorCode).toBe('INSUFFICIENT_PERMISSIONS');
      expect(error.statusCode).toBe(403);
    });

    it('should always have 403 status code', () => {
      const error1 = new ForbiddenError('Not allowed');
      const error2 = new ForbiddenError('Role not authorized', 'ROLE_FORBIDDEN');

      expect(error1.statusCode).toBe(403);
      expect(error2.statusCode).toBe(403);
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create error with default error code', () => {
      const error = new UnprocessableEntityError('Cannot process request');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnprocessableEntityError);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.message).toBe('Cannot process request');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new UnprocessableEntityError(
        'Card already replaced',
        'CARD_ALREADY_REPLACED',
      );

      expect(error.errorCode).toBe('CARD_ALREADY_REPLACED');
      expect(error.statusCode).toBe(422);
    });

    it('should always have 422 status code', () => {
      const error1 = new UnprocessableEntityError('Invalid state');
      const error2 = new UnprocessableEntityError('Duplicate entry', 'DUPLICATE');

      expect(error1.statusCode).toBe(422);
      expect(error2.statusCode).toBe(422);
    });
  });

  describe('InternalServerError', () => {
    it('should create error with default error code', () => {
      const error = new InternalServerError('Internal server error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal server error');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new InternalServerError('Database connection failed', 'DB_CONNECTION_ERROR');

      expect(error.errorCode).toBe('DB_CONNECTION_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should always have 500 status code', () => {
      const error1 = new InternalServerError('Server crashed');
      const error2 = new InternalServerError('Service unavailable', 'SERVICE_UNAVAILABLE');

      expect(error1.statusCode).toBe(500);
      expect(error2.statusCode).toBe(500);
    });
  });

  describe('Error Hierarchy', () => {
    it('should maintain instanceof relationships', () => {
      const validationError = new ValidationError('test');
      const notFoundError = new NotFoundError('test');
      const unauthorizedError = new UnauthorizedError('test');
      const forbiddenError = new ForbiddenError('test');
      const unprocessableError = new UnprocessableEntityError('test');
      const internalError = new InternalServerError('test');

      // All should be instances of AppError
      expect(validationError).toBeInstanceOf(AppError);
      expect(notFoundError).toBeInstanceOf(AppError);
      expect(unauthorizedError).toBeInstanceOf(AppError);
      expect(forbiddenError).toBeInstanceOf(AppError);
      expect(unprocessableError).toBeInstanceOf(AppError);
      expect(internalError).toBeInstanceOf(AppError);

      // All should be instances of Error
      expect(validationError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(Error);
      expect(unauthorizedError).toBeInstanceOf(Error);
      expect(forbiddenError).toBeInstanceOf(Error);
      expect(unprocessableError).toBeInstanceOf(Error);
      expect(internalError).toBeInstanceOf(Error);
    });

    it('should not be instances of each other', () => {
      const validationError = new ValidationError('test');
      const notFoundError = new NotFoundError('test');

      expect(validationError).not.toBeInstanceOf(NotFoundError);
      expect(notFoundError).not.toBeInstanceOf(ValidationError);
    });
  });

  describe('Error Messages', () => {
    it('should preserve error message', () => {
      const message = 'This is a detailed error message';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });

    it('should support multiline messages', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
      expect(error.message.split('\n')).toHaveLength(3);
    });

    it('should support empty messages', () => {
      const error = new ValidationError('');

      expect(error.message).toBe('');
    });
  });

  describe('Stack Traces', () => {
    it('should have unique stack traces for different errors', () => {
      function throwValidationError(): void {
        throw new ValidationError('Validation failed');
      }

      function throwNotFoundError(): void {
        throw new NotFoundError('Not found');
      }

      let validationStack: string | undefined;
      let notFoundStack: string | undefined;

      try {
        throwValidationError();
      } catch (error) {
        if (error instanceof ValidationError) {
          validationStack = error.stack;
        }
      }

      try {
        throwNotFoundError();
      } catch (error) {
        if (error instanceof NotFoundError) {
          notFoundStack = error.stack;
        }
      }

      expect(validationStack).toBeDefined();
      expect(notFoundStack).toBeDefined();
      expect(validationStack).not.toBe(notFoundStack);
    });
  });

  describe('Error Throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Test error');
      }).toThrow(ValidationError);
    });

    it('should be catchable as AppError', () => {
      try {
        throw new ValidationError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
