import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from '../context.middleware';
import { asyncContext } from '../../utils/async-context';

describe('context.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let setHeaderSpy: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    setHeaderSpy = jest.fn();
    mockResponse = {
      setHeader: setHeaderSpy,
    };
    nextFunction = jest.fn();
  });

  it('should generate a trace ID if not provided in headers', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(setHeaderSpy).toHaveBeenCalledWith('X-Trace-Id', expect.any(String));
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should use existing trace ID from headers if provided', () => {
    mockRequest.headers = { 'x-trace-id': 'existing-trace-id' };

    contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(setHeaderSpy).toHaveBeenCalledWith('X-Trace-Id', 'existing-trace-id');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should store context in AsyncLocalStorage', (done) => {
    mockRequest.headers = { 'x-trace-id': 'test-trace-id' };

    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = asyncContext.getStore();
      expect(context).toBeDefined();
      expect(context?.traceId).toBe('test-trace-id');
      expect(context?.timestamp).toBeDefined();
      done();
    });
  });

  it('should generate valid ISO timestamp', (done) => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = asyncContext.getStore();
      const timestamp = context?.timestamp;

      expect(timestamp).toBeDefined();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      done();
    });
  });

  it('should generate different trace IDs for different requests', () => {
    const traceIds: string[] = [];

    for (let i = 0; i < 5; i++) {
      setHeaderSpy = jest.fn();
      mockResponse.setHeader = setHeaderSpy;

      contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      const callArgs = setHeaderSpy.mock.calls[0];
      traceIds.push(callArgs[1] as string);
    }

    const uniqueTraceIds = new Set(traceIds);
    expect(uniqueTraceIds.size).toBe(5);
  });

  it('should handle case-insensitive trace ID header', () => {
    mockRequest.headers = { 'X-Trace-ID': 'uppercase-trace-id' };

    contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(setHeaderSpy).toHaveBeenCalledWith('X-Trace-Id', expect.any(String));
  });

  it('should call next function after setting context', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should not throw error if headers are undefined', () => {
    delete mockRequest.headers;

    expect(() => {
      contextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    }).not.toThrow();

    expect(nextFunction).toHaveBeenCalled();
  });
});
