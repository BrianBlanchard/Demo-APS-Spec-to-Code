import { ForbiddenException } from '../forbidden.exception';
import { BaseException } from '../base.exception';

describe('ForbiddenException', () => {
  it('should create exception with default message', () => {
    const exception = new ForbiddenException();
    expect(exception.message).toBe('Access forbidden');
    expect(exception.errorCode).toBe('ACCESS_FORBIDDEN');
    expect(exception.statusCode).toBe(403);
  });

  it('should create exception with custom message', () => {
    const exception = new ForbiddenException('Cannot access this card');
    expect(exception.message).toBe('Cannot access this card');
    expect(exception.errorCode).toBe('ACCESS_FORBIDDEN');
    expect(exception.statusCode).toBe(403);
  });

  it('should extend BaseException', () => {
    const exception = new ForbiddenException();
    expect(exception).toBeInstanceOf(BaseException);
  });

  it('should extend Error', () => {
    const exception = new ForbiddenException();
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const exception = new ForbiddenException();
    expect(exception.name).toBe('ForbiddenException');
  });
});
