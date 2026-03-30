import { describe, it, expect, beforeEach } from '@jest/globals';
import { asyncLocalStorage, getContext, getTraceId, runWithContext, RequestContext } from '../async-context';

describe('AsyncContext', () => {
  beforeEach(() => {
    // Clear any existing context
    asyncLocalStorage.exit(() => {});
  });

  describe('runWithContext', () => {
    it('should store and retrieve context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: new Date(),
      };

      runWithContext(context, () => {
        const retrieved = getContext();
        expect(retrieved).toEqual(context);
        expect(retrieved?.traceId).toBe('test-trace-123');
      });
    });

    it('should return callback result', () => {
      const context: RequestContext = {
        traceId: 'test-trace-456',
        timestamp: new Date(),
      };

      const result = runWithContext(context, () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should handle nested contexts', () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: new Date(),
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: new Date(),
      };

      runWithContext(context1, () => {
        expect(getTraceId()).toBe('trace-1');

        runWithContext(context2, () => {
          expect(getTraceId()).toBe('trace-2');
        });

        expect(getTraceId()).toBe('trace-1');
      });
    });

    it('should isolate context between calls', () => {
      const context1: RequestContext = {
        traceId: 'isolated-1',
        timestamp: new Date(),
      };

      const context2: RequestContext = {
        traceId: 'isolated-2',
        timestamp: new Date(),
      };

      runWithContext(context1, () => {
        expect(getTraceId()).toBe('isolated-1');
      });

      runWithContext(context2, () => {
        expect(getTraceId()).toBe('isolated-2');
      });
    });
  });

  describe('getContext', () => {
    it('should return undefined when no context is set', () => {
      const context = getContext();
      expect(context).toBeUndefined();
    });

    it('should return current context when set', () => {
      const testContext: RequestContext = {
        traceId: 'ctx-test-123',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      runWithContext(testContext, () => {
        const context = getContext();
        expect(context).toBeDefined();
        expect(context?.traceId).toBe('ctx-test-123');
        expect(context?.timestamp).toEqual(new Date('2024-01-15T10:00:00Z'));
      });
    });

    it('should return undefined outside of context', () => {
      const testContext: RequestContext = {
        traceId: 'outside-test',
        timestamp: new Date(),
      };

      runWithContext(testContext, () => {
        expect(getContext()).toBeDefined();
      });

      expect(getContext()).toBeUndefined();
    });
  });

  describe('getTraceId', () => {
    it('should return unknown when no context is set', () => {
      const traceId = getTraceId();
      expect(traceId).toBe('unknown');
    });

    it('should return trace ID from context', () => {
      const context: RequestContext = {
        traceId: 'trace-from-context',
        timestamp: new Date(),
      };

      runWithContext(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('trace-from-context');
      });
    });

    it('should return unknown after context is exited', () => {
      const context: RequestContext = {
        traceId: 'temporary-trace',
        timestamp: new Date(),
      };

      runWithContext(context, () => {
        expect(getTraceId()).toBe('temporary-trace');
      });

      expect(getTraceId()).toBe('unknown');
    });

    it('should handle multiple trace IDs in nested contexts', () => {
      const outer: RequestContext = {
        traceId: 'outer-trace',
        timestamp: new Date(),
      };

      const inner: RequestContext = {
        traceId: 'inner-trace',
        timestamp: new Date(),
      };

      runWithContext(outer, () => {
        expect(getTraceId()).toBe('outer-trace');

        runWithContext(inner, () => {
          expect(getTraceId()).toBe('inner-trace');
        });

        expect(getTraceId()).toBe('outer-trace');
      });
    });
  });

  describe('RequestContext type', () => {
    it('should have required fields', () => {
      const context: RequestContext = {
        traceId: 'test',
        timestamp: new Date(),
      };

      expect(context.traceId).toBeDefined();
      expect(context.timestamp).toBeDefined();
      expect(context.timestamp instanceof Date).toBe(true);
    });
  });
});
