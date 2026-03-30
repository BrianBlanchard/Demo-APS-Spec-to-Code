import { UnauthorizedException } from '../unauthorized.exception';
import { BaseException } from '../base.exception';

describe('UnauthorizedException', () => {
  it('should create exception with default message', () => {
    const exception = new UnauthorizedException();
    expect(exception.message).toBe('Unauthorized');
    expect(exception.errorCode).toBe('UNAUTHORIZED');
    expect(exception.statusCode).toBe(401);
  });

  it('should create exception with custom message', () => {
    const exception = new UnauthorizedException('Missing JWT token');
    expect(exception.message).toBe('Missing JWT token');
    expect(exception.errorCode).toBe('UNAUTHORIZED');
    expect(exception.statusCode).toBe(401);
  });

  it('should extend BaseException', () => {
    const exception = new UnauthorizedException();
    expect(exception).toBeInstanceOf(BaseException);
  });

  it('should extend Error', () => {
    const exception = new UnauthorizedException();
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const exception = new UnauthorizedException();
    expect(exception.name).toBe('UnauthorizedException');
  });
});
