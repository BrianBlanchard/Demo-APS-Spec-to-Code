import { BaseException } from '../base.exception';

class TestException extends BaseException {
  constructor() {
    super('TEST_ERROR', 'Test error message', 400);
  }
}

describe('BaseException', () => {
  let exception: TestException;

  beforeEach(() => {
    exception = new TestException();
  });

  it('should create an exception with error code', () => {
    expect(exception.errorCode).toBe('TEST_ERROR');
  });

  it('should create an exception with message', () => {
    expect(exception.message).toBe('Test error message');
  });

  it('should create an exception with status code', () => {
    expect(exception.statusCode).toBe(400);
  });

  it('should be an instance of Error', () => {
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have correct name', () => {
    expect(exception.name).toBe('TestException');
  });

  it('should have stack trace', () => {
    expect(exception.stack).toBeDefined();
  });
});
