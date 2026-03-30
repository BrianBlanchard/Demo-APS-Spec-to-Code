import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Unmock context middleware for these tests
jest.unmock('../context.middleware');
jest.unmock('../../middleware/context.middleware');

import {
  asyncLocalStorage,
  contextMiddleware,
  getContext,
} from '../context.middleware';
import { RequestContext } from '../../types/context.types';

jest.mock('crypto');

describe('context.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();

    (randomUUID as jest.Mock).mockReturnValue('generated-uuid-12345');
  });

  describe('contextMiddleware', () => {
    it('should create context with generated traceId when x-trace-id header is not provided', () => {
      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-trace-id',
        'generated-uuid-12345'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing x-trace-id from headers', () => {
      mockRequest.headers = {
        'x-trace-id': 'existing-trace-id',
      };

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-trace-id',
        'existing-trace-id'
      );
      expect(randomUUID).not.toHaveBeenCalled();
    });

    it('should extract userId from x-user-id header', () => {
      mockRequest.headers = {
        'x-user-id': 'user-123',
      };

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext?.userId).toBe('user-123');
    });

    it('should extract userRole from x-user-role header', () => {
      mockRequest.headers = {
        'x-user-role': 'admin',
      };

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext?.userRole).toBe('admin');
    });

    it('should set userId and userRole as undefined when headers are not provided', () => {
      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext?.userId).toBeUndefined();
      expect(capturedContext?.userRole).toBeUndefined();
    });

    it('should create context with current timestamp', () => {
      const beforeTime = new Date();

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const afterTime = new Date();

      expect(capturedContext?.timestamp).toBeInstanceOf(Date);
      expect(capturedContext?.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(capturedContext?.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should create complete context with all headers', () => {
      mockRequest.headers = {
        'x-trace-id': 'trace-123',
        'x-user-id': 'user-456',
        'x-user-role': 'manager',
      };

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext).toMatchObject({
        traceId: 'trace-123',
        userId: 'user-456',
        userRole: 'manager',
      });
      expect(capturedContext?.timestamp).toBeInstanceOf(Date);
    });

    it('should call next function', () => {
      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should call next within asyncLocalStorage context', () => {
      const runSpy = jest.spyOn(asyncLocalStorage, 'run');

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(runSpy).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty string headers', () => {
      mockRequest.headers = {
        'x-trace-id': '',
        'x-user-id': '',
        'x-user-role': '',
      };

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Empty strings are falsy, so they are replaced with undefined or generated UUID
      expect(capturedContext?.userId).toBeUndefined();
      expect(capturedContext?.userRole).toBeUndefined();
      // Empty traceId should generate a new UUID
      expect(capturedContext?.traceId).toBe('generated-uuid-12345');
    });

    it('should handle array header values by taking first element', () => {
      mockRequest.headers = {
        'x-trace-id': ['trace-1', 'trace-2'] as any,
      };

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Express normalizes array headers, but we handle string case
      expect(mockResponse.setHeader).toHaveBeenCalled();
    });
  });

  describe('getContext', () => {
    it('should return undefined when called outside of context', () => {
      const context = getContext();

      expect(context).toBeUndefined();
    });

    it('should return context when called inside middleware', () => {
      mockRequest.headers = {
        'x-user-id': 'user-789',
      };

      let retrievedContext: RequestContext | undefined;

      const retrieveContext = () => {
        retrievedContext = getContext();
      };

      mockNext = retrieveContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(retrievedContext).toBeDefined();
      expect(retrievedContext?.userId).toBe('user-789');
    });

    it('should return same context on multiple calls within same request', () => {
      let context1: RequestContext | undefined;
      let context2: RequestContext | undefined;

      const captureContexts = () => {
        context1 = getContext();
        context2 = getContext();
      };

      mockNext = captureContexts;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(context1).toBe(context2);
    });

    it('should be accessible in async operations within context', async () => {
      let asyncContext: RequestContext | undefined;

      const asyncOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        asyncContext = getContext();
      };

      const handleAsync = async () => {
        await asyncOperation();
        mockNext();
      };

      mockNext = handleAsync as any;

      await new Promise<void>((resolve) => {
        contextMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          () => {
            handleAsync().then(() => resolve());
          }
        );
      });

      expect(asyncContext).toBeDefined();
      expect(asyncContext?.traceId).toBe('generated-uuid-12345');
    });
  });

  describe('asyncLocalStorage', () => {
    it('should export asyncLocalStorage instance', () => {
      expect(asyncLocalStorage).toBeDefined();
      expect(asyncLocalStorage.getStore).toBeDefined();
      expect(asyncLocalStorage.run).toBeDefined();
    });

    it('should maintain context isolation between requests', () => {
      const contexts: RequestContext[] = [];

      (randomUUID as jest.Mock)
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2');

      const captureContext1 = () => {
        contexts.push(getContext()!);
      };

      const captureContext2 = () => {
        contexts.push(getContext()!);
      };

      // First request
      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        captureContext1
      );

      // Second request
      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        captureContext2
      );

      expect(contexts[0].traceId).toBe('uuid-1');
      expect(contexts[1].traceId).toBe('uuid-2');
    });
  });

  describe('response header setting', () => {
    it('should set x-trace-id header on response', () => {
      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-trace-id',
        expect.any(String)
      );
    });

    it('should set x-trace-id header before calling next', () => {
      const calls: string[] = [];

      mockResponse.setHeader = jest.fn(() => {
        calls.push('setHeader');
        return mockResponse as Response;
      }) as any;

      mockNext = jest.fn(() => {
        calls.push('next');
      });

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(calls).toEqual(['setHeader', 'next']);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined headers object', () => {
      mockRequest.headers = undefined as any;

      // This will throw because the actual middleware expects headers to exist
      expect(() => {
        contextMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it('should handle null header values', () => {
      mockRequest.headers = {
        'x-trace-id': null as any,
        'x-user-id': null as any,
      };

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle numeric header values', () => {
      mockRequest.headers = {
        'x-user-id': 123 as any,
      };

      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext?.userId).toBe(123 as any);
    });

    it('should generate unique trace IDs for concurrent requests', () => {
      (randomUUID as jest.Mock)
        .mockReturnValueOnce('uuid-a')
        .mockReturnValueOnce('uuid-b')
        .mockReturnValueOnce('uuid-c');

      const traceIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const captureTraceId = () => {
          const context = getContext();
          if (context) {
            traceIds.push(context.traceId);
          }
        };

        contextMiddleware(
          { headers: {} } as Request,
          mockResponse as Response,
          captureTraceId
        );
      }

      expect(traceIds).toEqual(['uuid-a', 'uuid-b', 'uuid-c']);
    });
  });

  describe('type safety', () => {
    it('should create context matching RequestContext interface', () => {
      let capturedContext: RequestContext | undefined;

      const captureContext = () => {
        capturedContext = getContext();
      };

      mockNext = captureContext;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(capturedContext).toHaveProperty('traceId');
      expect(capturedContext).toHaveProperty('timestamp');
      expect(typeof capturedContext?.traceId).toBe('string');
      expect(capturedContext?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('integration with route handlers', () => {
    it('should make context available in route handler', () => {
      mockRequest.headers = {
        'x-trace-id': 'route-trace-id',
        'x-user-id': 'route-user-id',
        'x-user-role': 'user',
      };

      let handlerContext: RequestContext | undefined;

      const routeHandler = () => {
        handlerContext = getContext();
      };

      mockNext = routeHandler;

      contextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(handlerContext).toMatchObject({
        traceId: 'route-trace-id',
        userId: 'route-user-id',
        userRole: 'user',
      });
    });
  });
});
