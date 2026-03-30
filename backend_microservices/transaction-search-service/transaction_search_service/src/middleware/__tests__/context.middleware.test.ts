import { Request, Response } from 'express';
import { contextMiddleware } from '../context.middleware';
import { getRequestContext } from '../../utils/context.storage';

describe('ContextMiddleware - Middleware Layer', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: setHeaderMock,
    };
  });

  it('should generate new traceId when not provided', (done) => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = getRequestContext();
      expect(context).toBeDefined();
      expect(context?.traceId).toBeDefined();
      expect(context?.traceId.length).toBeGreaterThan(0);
      expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', context?.traceId);
      done();
    });
  });

  it('should use provided traceId from headers', (done) => {
    mockRequest.headers = {
      'x-trace-id': 'custom-trace-123',
    };

    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = getRequestContext();
      expect(context?.traceId).toBe('custom-trace-123');
      expect(setHeaderMock).toHaveBeenCalledWith('x-trace-id', 'custom-trace-123');
      done();
    });
  });

  it('should store userId from headers', (done) => {
    mockRequest.headers = {
      'x-user-id': 'user-456',
    };

    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = getRequestContext();
      expect(context?.userId).toBe('user-456');
      done();
    });
  });

  it('should store timestamp', (done) => {
    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = getRequestContext();
      expect(context?.timestamp).toBeDefined();
      expect(new Date(context?.timestamp!).getTime()).toBeGreaterThan(0);
      done();
    });
  });

  it('should call next function', (done) => {
    const nextMock = jest.fn(() => {
      expect(nextMock).toHaveBeenCalled();
      done();
    });

    contextMiddleware(mockRequest as Request, mockResponse as Response, nextMock);
  });

  it('should handle missing userId header', (done) => {
    mockRequest.headers = {};

    contextMiddleware(mockRequest as Request, mockResponse as Response, () => {
      const context = getRequestContext();
      expect(context?.userId).toBeUndefined();
      done();
    });
  });
});
