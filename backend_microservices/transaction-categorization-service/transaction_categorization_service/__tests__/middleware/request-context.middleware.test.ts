import { Request, Response } from 'express';
import { requestContextMiddleware } from '../../src/middleware/request-context.middleware';
import { requestContextStorage } from '../../src/utils/logger';

describe('Request Context Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('Trace ID handling', () => {
    it('should use trace ID from request header if present', (done) => {
      mockRequest.headers = {
        'x-trace-id': 'existing-trace-id',
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Small delay to allow async context to propagate
      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Trace-ID', 'existing-trace-id');
        done();
      }, 10);
    });

    it('should generate new UUID trace ID if not present in header', (done) => {
      mockRequest.headers = {};

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        expect(setHeaderCall[0]).toBe('X-Trace-ID');
        expect(setHeaderCall[1]).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
        done();
      }, 10);
    });

    it('should handle lowercase x-trace-id header', (done) => {
      mockRequest.headers = {
        'x-trace-id': 'lowercase-trace-id',
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Trace-ID', 'lowercase-trace-id');
        done();
      }, 10);
    });

    it('should handle uppercase X-TRACE-ID header', (done) => {
      mockRequest.headers = {
        'X-TRACE-ID': 'uppercase-trace-id',
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        expect(setHeaderCall[0]).toBe('X-Trace-ID');
        // Note: Express normalizes headers to lowercase
        done();
      }, 10);
    });
  });

  describe('Context storage', () => {
    it('should store context in AsyncLocalStorage', (done) => {
      mockRequest.headers = {
        'x-trace-id': 'test-trace-id',
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        () => {
          const context = requestContextStorage.getStore();
          expect(context).toBeDefined();
          expect(context?.traceId).toBe('test-trace-id');
          done();
        }
      );
    });

    it('should store timestamp in context', (done) => {
      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        () => {
          const context = requestContextStorage.getStore();
          expect(context?.timestamp).toBeDefined();
          expect(context?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          done();
        }
      );
    });

    it('should create ISO timestamp', (done) => {
      const beforeTime = new Date();

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        () => {
          const context = requestContextStorage.getStore();
          const contextTime = new Date(context!.timestamp);

          expect(contextTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
          done();
        }
      );
    });
  });

  describe('Next function', () => {
    it('should call next function', (done) => {
      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockNext).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should call next within async context', (done) => {
      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        () => {
          const context = requestContextStorage.getStore();
          expect(context).toBeDefined();
          mockNext();
        }
      );

      setTimeout(() => {
        expect(mockNext).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should not throw error when calling next', () => {
      expect(() => {
        requestContextMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).not.toThrow();
    });
  });

  describe('Multiple requests', () => {
    it('should handle multiple concurrent requests with different trace IDs', (done) => {
      let completedRequests = 0;
      const expectedRequests = 3;

      const requests = ['trace-1', 'trace-2', 'trace-3'];

      requests.forEach((traceId) => {
        const req: Partial<Request> = { headers: { 'x-trace-id': traceId } };
        const res: Partial<Response> = { setHeader: jest.fn() };

        requestContextMiddleware(req as Request, res as Response, () => {
          const context = requestContextStorage.getStore();
          expect(context?.traceId).toBe(traceId);

          completedRequests++;
          if (completedRequests === expectedRequests) {
            done();
          }
        });
      });
    });

    it('should isolate contexts between requests', (done) => {
      const req1: Partial<Request> = { headers: { 'x-trace-id': 'trace-1' } };
      const res1: Partial<Response> = { setHeader: jest.fn() };

      const req2: Partial<Request> = { headers: { 'x-trace-id': 'trace-2' } };
      const res2: Partial<Response> = { setHeader: jest.fn() };

      let checked = 0;

      requestContextMiddleware(req1 as Request, res1 as Response, () => {
        const context1 = requestContextStorage.getStore();
        expect(context1?.traceId).toBe('trace-1');
        checked++;
        if (checked === 2) done();
      });

      requestContextMiddleware(req2 as Request, res2 as Response, () => {
        const context2 = requestContextStorage.getStore();
        expect(context2?.traceId).toBe('trace-2');
        checked++;
        if (checked === 2) done();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing x-trace-id in headers', (done) => {
      mockRequest.headers = {};

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockNext).toHaveBeenCalled();
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        expect(setHeaderCall[0]).toBe('X-Trace-ID');
        expect(setHeaderCall[1]).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
        done();
      }, 10);
    });

    it('should handle empty headers object', (done) => {
      mockRequest.headers = {};

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockNext).toHaveBeenCalled();
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        expect(setHeaderCall[0]).toBe('X-Trace-ID');
        done();
      }, 10);
    });

    it('should handle empty string trace ID in header', (done) => {
      mockRequest.headers = {
        'x-trace-id': '',
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        // Empty string is falsy, so a new UUID should be generated
        expect(setHeaderCall[1]).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        );
        done();
      }, 10);
    });

    it('should handle very long trace ID', (done) => {
      const longTraceId = 'a'.repeat(1000);
      mockRequest.headers = {
        'x-trace-id': longTraceId,
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Trace-ID', longTraceId);
        done();
      }, 10);
    });

    it('should handle special characters in trace ID', (done) => {
      const specialTraceId = 'trace-id-with-special-chars-!@#$%';
      mockRequest.headers = {
        'x-trace-id': specialTraceId,
      };

      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Trace-ID', specialTraceId);
        done();
      }, 10);
    });
  });

  describe('Response headers', () => {
    it('should set X-Trace-ID header on response', (done) => {
      requestContextMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      setTimeout(() => {
        expect(mockResponse.setHeader).toHaveBeenCalled();
        const setHeaderCall = (mockResponse.setHeader as jest.Mock).mock.calls[0];
        expect(setHeaderCall[0]).toBe('X-Trace-ID');
        done();
      }, 10);
    });

    it('should set header before calling next', (done) => {
      let headerSet = false;

      mockResponse.setHeader = jest.fn().mockImplementation(() => {
        headerSet = true;
        return mockResponse as Response;
      });

      requestContextMiddleware(mockRequest as Request, mockResponse as Response, () => {
        expect(headerSet).toBe(true);
        done();
      });
    });
  });
});
