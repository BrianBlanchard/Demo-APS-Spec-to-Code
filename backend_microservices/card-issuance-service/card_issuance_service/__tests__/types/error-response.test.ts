import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  ServiceUnavailableError,
} from '../../src/types/error-response';

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError(400, 'TEST_ERROR', 'Test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('AppError');
  });

  it('should have stack trace', () => {
    const error = new AppError(500, 'ERROR', 'Message');
    expect(error.stack).toBeDefined();
  });
});

describe('ValidationError', () => {
  it('should create validation error with 400 status', () => {
    const error = new ValidationError('Invalid input');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid input');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new ValidationError('Test validation error');
    }).toThrow('Test validation error');
  });
});

describe('NotFoundError', () => {
  it('should create not found error with 404 status', () => {
    const error = new NotFoundError('Resource not found');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new NotFoundError('Account not found');
    }).toThrow('Account not found');
  });
});

describe('ConflictError', () => {
  it('should create conflict error with 409 status', () => {
    const error = new ConflictError('Resource already exists');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe('CONFLICT');
    expect(error.message).toBe('Resource already exists');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new ConflictError('Card number already exists');
    }).toThrow('Card number already exists');
  });
});

describe('UnprocessableEntityError', () => {
  it('should create unprocessable entity error with 422 status', () => {
    const error = new UnprocessableEntityError('Cannot process request');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe('UNPROCESSABLE_ENTITY');
    expect(error.message).toBe('Cannot process request');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new UnprocessableEntityError('Account not active');
    }).toThrow('Account not active');
  });
});

describe('ServiceUnavailableError', () => {
  it('should create service unavailable error with 503 status', () => {
    const error = new ServiceUnavailableError('Service down');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(503);
    expect(error.errorCode).toBe('SERVICE_UNAVAILABLE');
    expect(error.message).toBe('Service down');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new ServiceUnavailableError('Encryption service unavailable');
    }).toThrow('Encryption service unavailable');
  });
});

describe('Error hierarchy', () => {
  it('should maintain error inheritance chain', () => {
    const error = new ValidationError('Test');
    expect(error instanceof ValidationError).toBe(true);
    expect(error instanceof AppError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('should allow catching specific error types', () => {
    try {
      throw new NotFoundError('Not found');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      if (error instanceof NotFoundError) {
        expect(error.statusCode).toBe(404);
      }
    }
  });

  it('should allow catching all app errors', () => {
    const errors = [
      new ValidationError('Validation'),
      new NotFoundError('Not found'),
      new ConflictError('Conflict'),
      new UnprocessableEntityError('Unprocessable'),
      new ServiceUnavailableError('Unavailable'),
    ];

    errors.forEach((error) => {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.errorCode).toBeDefined();
    });
  });
});
