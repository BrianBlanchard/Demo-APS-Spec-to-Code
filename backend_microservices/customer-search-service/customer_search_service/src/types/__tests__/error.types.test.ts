import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
  ServiceUnavailableError,
} from '../error.types';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create an app error with all properties', () => {
      const error = new AppError('TEST_ERROR', 'Test message', 400, true);

      expect(error).toBeInstanceOf(Error);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should default to status code 500', () => {
      const error = new AppError('TEST_ERROR', 'Test message');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should have stack trace', () => {
      const error = new AppError('TEST_ERROR', 'Test message');

      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with status 400', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an unauthorized error with status 401', () => {
      const error = new UnauthorizedError('Invalid credentials');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a forbidden error with status 403', () => {
      const error = new ForbiddenError('Access denied');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });

    it('should use default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with status 404', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create an unprocessable entity error with status 422', () => {
      const error = new UnprocessableEntityError('Invalid data format');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
      expect(error.message).toBe('Invalid data format');
      expect(error.statusCode).toBe(422);
    });
  });

  describe('InternalServerError', () => {
    it('should create an internal server error with status 500', () => {
      const error = new InternalServerError('Something went wrong');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
    });

    it('should use default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal Server Error');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create a service unavailable error with status 503', () => {
      const error = new ServiceUnavailableError('Service down');

      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('Service down');
      expect(error.statusCode).toBe(503);
    });

    it('should use default message', () => {
      const error = new ServiceUnavailableError();

      expect(error.message).toBe('Service Unavailable');
    });
  });

  describe('Error inheritance', () => {
    it('should allow instanceof checks', () => {
      const validationError = new ValidationError('Test');
      const unauthorizedError = new UnauthorizedError('Test');

      expect(validationError instanceof AppError).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(unauthorizedError instanceof AppError).toBe(true);
      expect(validationError instanceof UnauthorizedError).toBe(false);
    });
  });
});
