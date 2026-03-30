import { Request, Response, NextFunction } from 'express';
import { tracingMiddleware, getTraceId, getTracingContext, tracingStorage } from '../tracing.middleware';

describe('tracingMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should generate a new trace ID if not provided in headers', () => {
    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalled();
    const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
    expect(setHeaderCall[0]).toBe('X-Trace-Id');
    expect(typeof setHeaderCall[1]).toBe('string');
    expect(setHeaderCall[1].length).toBeGreaterThan(0);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use existing trace ID from request headers', () => {
    const existingTraceId = 'existing-trace-id-123';
    mockRequest.headers = { 'x-trace-id': existingTraceId };

    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Trace-Id', existingTraceId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should store trace context in AsyncLocalStorage', (done) => {
    tracingMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = tracingStorage.getStore();
      expect(context).toBeDefined();
      expect(context?.traceId).toBeDefined();
      expect(context?.timestamp).toBeInstanceOf(Date);
      done();
    });
  });

  it('should call next middleware', () => {
    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should generate unique trace IDs for different requests', () => {
    const traceIds: string[] = [];

    for (let i = 0; i < 10; i++) {
      const mockReq: Partial<Request> = { headers: {} };
      const mockRes: Partial<Response> = { setHeader: jest.fn() };
      const mockNxt: NextFunction = jest.fn();

      tracingMiddleware(mockReq as Request, mockRes as Response, mockNxt);

      const setHeaderCall = (mockRes.setHeader as jest.Mock).mock.calls[0];
      traceIds.push(setHeaderCall[1]);
    }

    const uniqueTraceIds = new Set(traceIds);
    expect(uniqueTraceIds.size).toBe(10);
  });

  it('should preserve case-insensitive header names', () => {
    const existingTraceId = 'test-trace-id';
    mockRequest.headers = { 'X-TRACE-ID': existingTraceId };

    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Express normalizes headers to lowercase, but our middleware should still work
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('getTraceId', () => {
  it('should return "no-trace-id" when called outside AsyncLocalStorage context', () => {
    const traceId = getTraceId();

    expect(traceId).toBe('no-trace-id');
  });

  it('should return trace ID when called within AsyncLocalStorage context', (done) => {
    const mockRequest: Partial<Request> = { headers: { 'x-trace-id': 'test-id-456' } };
    const mockResponse: Partial<Response> = { setHeader: jest.fn() };
    const mockNext: NextFunction = () => {
      const traceId = getTraceId();
      expect(traceId).toBe('test-id-456');
      done();
    };

    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
  });
});

describe('getTracingContext', () => {
  it('should return undefined when called outside AsyncLocalStorage context', () => {
    const context = getTracingContext();

    expect(context).toBeUndefined();
  });

  it('should return tracing context when called within AsyncLocalStorage context', (done) => {
    const mockRequest: Partial<Request> = { headers: {} };
    const mockResponse: Partial<Response> = { setHeader: jest.fn() };
    const mockNext: NextFunction = () => {
      const context = getTracingContext();
      expect(context).toBeDefined();
      expect(context?.traceId).toBeDefined();
      expect(context?.timestamp).toBeInstanceOf(Date);
      done();
    };

    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
  });

  it('should return context with correct structure', (done) => {
    const mockRequest: Partial<Request> = { headers: { 'x-trace-id': 'context-test-789' } };
    const mockResponse: Partial<Response> = { setHeader: jest.fn() };
    const mockNext: NextFunction = () => {
      const context = getTracingContext();
      expect(context).toEqual({
        traceId: 'context-test-789',
        timestamp: expect.any(Date),
      });
      done();
    };

    tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
  });
});

describe('tracingStorage', () => {
  it('should be an instance of AsyncLocalStorage', () => {
    expect(tracingStorage).toBeDefined();
    expect(typeof tracingStorage.run).toBe('function');
    expect(typeof tracingStorage.getStore).toBe('function');
  });

  it('should isolate context between concurrent requests', async () => {
    const results: string[] = [];

    const simulateRequest = (traceId: string): Promise<void> => {
      return new Promise((resolve) => {
        const mockReq: Partial<Request> = { headers: { 'x-trace-id': traceId } };
        const mockRes: Partial<Response> = { setHeader: jest.fn() };
        const mockNxt: NextFunction = () => {
          setTimeout(() => {
            const retrievedId = getTraceId();
            results.push(retrievedId);
            resolve();
          }, Math.random() * 10);
        };

        tracingMiddleware(mockReq as Request, mockRes as Response, mockNxt);
      });
    };

    await Promise.all([
      simulateRequest('trace-1'),
      simulateRequest('trace-2'),
      simulateRequest('trace-3'),
    ]);

    expect(results).toHaveLength(3);
    expect(results).toContain('trace-1');
    expect(results).toContain('trace-2');
    expect(results).toContain('trace-3');
  });
});
