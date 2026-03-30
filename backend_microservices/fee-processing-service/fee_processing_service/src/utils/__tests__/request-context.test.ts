import { requestContextStorage, getRequestContext, getTraceId } from '../request-context';
import { RequestContext } from '../../types/request-context';

describe('Request Context', () => {
  describe('requestContextStorage', () => {
    it('should store and retrieve context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const retrieved = requestContextStorage.getStore();
        expect(retrieved).toBe(context);
      });
    });

    it('should return undefined outside of context', () => {
      const retrieved = requestContextStorage.getStore();
      expect(retrieved).toBeUndefined();
    });

    it('should isolate contexts between runs', () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: new Date(),
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: new Date(),
      };

      requestContextStorage.run(context1, () => {
        const retrieved = requestContextStorage.getStore();
        expect(retrieved?.traceId).toBe('trace-1');
      });

      requestContextStorage.run(context2, () => {
        const retrieved = requestContextStorage.getStore();
        expect(retrieved?.traceId).toBe('trace-2');
      });
    });
  });

  describe('getRequestContext', () => {
    it('should return context when inside run', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const retrieved = getRequestContext();
        expect(retrieved).toBe(context);
        expect(retrieved?.traceId).toBe('test-trace-id');
      });
    });

    it('should return undefined when outside run', () => {
      const retrieved = getRequestContext();
      expect(retrieved).toBeUndefined();
    });

    it('should return full context object', () => {
      const timestamp = new Date();
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp,
      };

      requestContextStorage.run(context, () => {
        const retrieved = getRequestContext();
        expect(retrieved?.traceId).toBe('test-trace-id');
        expect(retrieved?.timestamp).toBe(timestamp);
      });
    });
  });

  describe('getTraceId', () => {
    it('should return trace ID from context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id-123',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('test-trace-id-123');
      });
    });

    it('should return "no-trace-id" when no context exists', () => {
      const traceId = getTraceId();
      expect(traceId).toBe('no-trace-id');
    });

    it('should handle UUID format trace IDs', () => {
      const context: RequestContext = {
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
      });
    });

    it('should handle different trace ID formats', () => {
      const testTraceIds = ['abc-123', 'trace_001', 'TRACE-XYZ-999'];

      testTraceIds.forEach((testId) => {
        const context: RequestContext = {
          traceId: testId,
          timestamp: new Date(),
        };

        requestContextStorage.run(context, () => {
          const traceId = getTraceId();
          expect(traceId).toBe(testId);
        });
      });
    });

    it('should return correct trace ID in nested async operations', async () => {
      const context: RequestContext = {
        traceId: 'async-trace-id',
        timestamp: new Date(),
      };

      await requestContextStorage.run(context, async () => {
        const traceId1 = getTraceId();
        expect(traceId1).toBe('async-trace-id');

        await Promise.resolve();

        const traceId2 = getTraceId();
        expect(traceId2).toBe('async-trace-id');
      });
    });
  });

  describe('Context Isolation', () => {
    it('should maintain separate contexts for concurrent operations', async () => {
      const context1: RequestContext = {
        traceId: 'concurrent-1',
        timestamp: new Date(),
      };

      const context2: RequestContext = {
        traceId: 'concurrent-2',
        timestamp: new Date(),
      };

      const promise1 = requestContextStorage.run(context1, async () => {
        await Promise.resolve();
        return getTraceId();
      });

      const promise2 = requestContextStorage.run(context2, async () => {
        await Promise.resolve();
        return getTraceId();
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('concurrent-1');
      expect(result2).toBe('concurrent-2');
    });

    it('should not leak context between runs', () => {
      const context1: RequestContext = {
        traceId: 'context-1',
        timestamp: new Date(),
      };

      requestContextStorage.run(context1, () => {
        expect(getTraceId()).toBe('context-1');
      });

      expect(getTraceId()).toBe('no-trace-id');
    });
  });
});
