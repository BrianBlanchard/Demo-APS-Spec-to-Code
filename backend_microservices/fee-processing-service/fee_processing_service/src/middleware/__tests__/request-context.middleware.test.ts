import { Request, Response, NextFunction } from 'express';
import { requestContextMiddleware } from '../request-context.middleware';
import { getRequestContext, getTraceId } from '../../utils/request-context';

describe('Request Context Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: setHeaderMock,
    };

    mockNext = jest.fn();
  });

  it('should generate trace ID if not provided', () => {
    requestContextMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', expect.any(String));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use provided trace ID from headers', () => {
    mockRequest.headers = { 'x-trace-id': 'custom-trace-id' };

    requestContextMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', 'custom-trace-id');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should store context in AsyncLocalStorage', (done) => {
    mockRequest.headers = { 'x-trace-id': 'test-trace-id' };

    mockNext = jest.fn(() => {
      const context = getRequestContext();
      expect(context).toBeDefined();
      expect(context?.traceId).toBe('test-trace-id');
      expect(getTraceId()).toBe('test-trace-id');
      done();
    });

    requestContextMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );
  });

  it('should include timestamp in context', (done) => {
    mockNext = jest.fn(() => {
      const context = getRequestContext();
      expect(context?.timestamp).toBeInstanceOf(Date);
      done();
    });

    requestContextMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );
  });
});
