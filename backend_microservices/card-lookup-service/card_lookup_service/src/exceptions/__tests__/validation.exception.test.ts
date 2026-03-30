import { ValidationException } from '../validation.exception';
import { BaseException } from '../base.exception';

describe('ValidationException', () => {
  it('should create exception with default message', () => {
    const exception = new ValidationException();
    expect(exception.message).toBe('Validation failed');
    expect(exception.errorCode).toBe('VALIDATION_ERROR');
    expect(exception.statusCode).toBe(400);
  });

  it('should create exception with custom message', () => {
    const exception = new ValidationException('Invalid card number format');
    expect(exception.message).toBe('Invalid card number format');
    expect(exception.errorCode).toBe('VALIDATION_ERROR');
    expect(exception.statusCode).toBe(400);
  });

  it('should extend BaseException', () => {
    const exception = new ValidationException();
    expect(exception).toBeInstanceOf(BaseException);
  });

  it('should extend Error', () => {
    const exception = new ValidationException();
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const exception = new ValidationException();
    expect(exception.name).toBe('ValidationException');
  });
});
