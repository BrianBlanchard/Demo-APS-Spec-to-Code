import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from '../context.middleware';
import { getRequestContext } from '../../config/async-context.config';

describe('Context Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();
    mockNext = jest.fn();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: setHeaderMock,
    };
  });

  it('should generate a new traceId when not provided in headers', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(context).toBeDefined();
    expect(context?.traceId).toBeDefined();
    expect(context?.traceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(context?.timestamp).toBeDefined();
    expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', context?.traceId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use existing traceId from x-trace-id header', () => {
    const existingTraceId = '550e8400-e29b-41d4-a716-446655440000';
    mockRequest.headers = {
      'x-trace-id': existingTraceId,
    };

    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(context).toBeDefined();
    expect(context?.traceId).toBe(existingTraceId);
    expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', existingTraceId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set timestamp in ISO 8601 format', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(context?.timestamp).toBeDefined();
    expect(context?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set x-trace-id response header', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', context?.traceId);
  });

  it('should call next middleware', () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should create new context for each request', () => {
    const traceId1 = '111e1111-e11b-11d1-a111-111111111111';
    const traceId2 = '222e2222-e22b-22d2-a222-222222222222';

    mockRequest.headers = { 'x-trace-id': traceId1 };
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const context1 = getRequestContext();

    mockRequest.headers = { 'x-trace-id': traceId2 };
    const newSetHeaderMock = jest.fn();
    const newMockResponse = { setHeader: newSetHeaderMock };
    contextMiddleware(mockRequest as Request, newMockResponse as any, mockNext);
    const context2 = getRequestContext();

    expect(context1?.traceId).toBe(traceId1);
    expect(context2?.traceId).toBe(traceId2);
  });

  it('should handle missing headers object', () => {
    mockRequest.headers = undefined;

    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(context).toBeDefined();
    expect(context?.traceId).toBeDefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty headers object', () => {
    mockRequest.headers = {};

    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();

    expect(context).toBeDefined();
    expect(context?.traceId).toBeDefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should propagate context through async operations', async () => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    const context = getRequestContext();
    const traceIdBeforeAsync = context?.traceId;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const contextAfterAsync = getRequestContext();
    expect(contextAfterAsync?.traceId).toBe(traceIdBeforeAsync);
  });
});
