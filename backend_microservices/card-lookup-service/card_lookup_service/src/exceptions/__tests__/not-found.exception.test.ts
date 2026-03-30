import { NotFoundException } from '../not-found.exception';
import { BaseException } from '../base.exception';

describe('NotFoundException', () => {
  it('should create exception with default message', () => {
    const exception = new NotFoundException();
    expect(exception.message).toBe('Resource not found');
    expect(exception.errorCode).toBe('RESOURCE_NOT_FOUND');
    expect(exception.statusCode).toBe(404);
  });

  it('should create exception with custom message', () => {
    const exception = new NotFoundException('Card not found');
    expect(exception.message).toBe('Card not found');
    expect(exception.errorCode).toBe('RESOURCE_NOT_FOUND');
    expect(exception.statusCode).toBe(404);
  });

  it('should extend BaseException', () => {
    const exception = new NotFoundException();
    expect(exception).toBeInstanceOf(BaseException);
  });

  it('should extend Error', () => {
    const exception = new NotFoundException();
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    const exception = new NotFoundException();
    expect(exception.name).toBe('NotFoundException');
  });
});
