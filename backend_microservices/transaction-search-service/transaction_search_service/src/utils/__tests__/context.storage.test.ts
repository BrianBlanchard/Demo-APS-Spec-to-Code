import { requestContextStorage, getRequestContext, getTraceId } from '../context.storage';
import { RequestContext } from '../../types';

describe('ContextStorage - Utilities/Helpers', () => {
  describe('requestContextStorage', () => {
    it('should store and retrieve context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        userId: 'user123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const retrieved = getRequestContext();
        expect(retrieved).toEqual(context);
      });
    });

    it('should return undefined when no context is set', () => {
      const retrieved = getRequestContext();
      expect(retrieved).toBeUndefined();
    });

    it('should isolate contexts between runs', () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-01-15T14:30:00Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-01-15T14:30:01Z',
      };

      requestContextStorage.run(context1, () => {
        expect(getRequestContext()?.traceId).toBe('trace-1');
      });

      requestContextStorage.run(context2, () => {
        expect(getRequestContext()?.traceId).toBe('trace-2');
      });
    });
  });

  describe('getTraceId', () => {
    it('should return traceId from context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('test-trace-123');
      });
    });

    it('should return "unknown" when no context is set', () => {
      const traceId = getTraceId();
      expect(traceId).toBe('unknown');
    });

    it('should handle context without userId', () => {
      const context: RequestContext = {
        traceId: 'trace-no-user',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('trace-no-user');
        const ctx = getRequestContext();
        expect(ctx?.userId).toBeUndefined();
      });
    });
  });
});
