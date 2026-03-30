import { InternalServerException } from '../internal-server.exception';
import { BaseException } from '../base.exception';

describe('InternalServerException', () => {
  it('should create exception with default message', () => {
    const exception = new InternalServerException();
    expect(exception.message).toBe('Internal server error');
    expect(exception.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(exception.statusCode).toBe(500);
  });

  it('should create exception with custom message', () => {
    const exception = new InternalServerException('Database connection failed');
    expect(exception.message).toBe('Database connection failed');
    expect(exception.errorCode).toBe('INTERNAL_SERVER_ERROR');
    expect(exception.statusCode).toBe(500);
  });

  it('should extend BaseException', () => {
    const exception = new InternalServerException();
    expect(exception).toBeInstanceOf(BaseException);
  });

  it('should extend Error', () => {
    const exception = new InternalServerException();
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const exception = new InternalServerException();
    expect(exception.name).toBe('InternalServerException');
  });
});
