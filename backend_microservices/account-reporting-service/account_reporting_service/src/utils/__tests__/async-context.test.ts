import { asyncContext, getTraceId, getTimestamp, RequestContext } from '../async-context';

describe('async-context', () => {
  describe('asyncContext', () => {
    it('should store and retrieve context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-31T10:30:00.000Z',
      };

      asyncContext.run(context, () => {
        const stored = asyncContext.getStore();
        expect(stored).toEqual(context);
      });
    });

    it('should return undefined when no context is set', () => {
      const stored = asyncContext.getStore();
      expect(stored).toBeUndefined();
    });

    it('should isolate context between different async calls', (done) => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-01-31T10:00:00.000Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-01-31T11:00:00.000Z',
      };

      asyncContext.run(context1, () => {
        const stored1 = asyncContext.getStore();
        expect(stored1?.traceId).toBe('trace-1');

        asyncContext.run(context2, () => {
          const stored2 = asyncContext.getStore();
          expect(stored2?.traceId).toBe('trace-2');
        });

        const storedAfter = asyncContext.getStore();
        expect(storedAfter?.traceId).toBe('trace-1');
        done();
      });
    });

    it('should support nested context', () => {
      const outerContext: RequestContext = {
        traceId: 'outer-trace',
        timestamp: '2024-01-31T10:00:00.000Z',
      };

      const innerContext: RequestContext = {
        traceId: 'inner-trace',
        timestamp: '2024-01-31T11:00:00.000Z',
      };

      asyncContext.run(outerContext, () => {
        expect(asyncContext.getStore()?.traceId).toBe('outer-trace');

        asyncContext.run(innerContext, () => {
          expect(asyncContext.getStore()?.traceId).toBe('inner-trace');
        });

        expect(asyncContext.getStore()?.traceId).toBe('outer-trace');
      });
    });
  });

  describe('getTraceId', () => {
    it('should return trace ID from context when available', () => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: '2024-01-31T10:30:00.000Z',
      };

      asyncContext.run(context, () => {
        expect(getTraceId()).toBe('test-trace-123');
      });
    });

    it('should return "unknown" when context is not available', () => {
      expect(getTraceId()).toBe('unknown');
    });

    it('should return "unknown" when context exists but traceId is missing', () => {
      const context = {} as RequestContext;

      asyncContext.run(context, () => {
        expect(getTraceId()).toBe('unknown');
      });
    });

    it('should work correctly in nested contexts', () => {
      const context1: RequestContext = {
        traceId: 'trace-outer',
        timestamp: '2024-01-31T10:00:00.000Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-inner',
        timestamp: '2024-01-31T11:00:00.000Z',
      };

      asyncContext.run(context1, () => {
        expect(getTraceId()).toBe('trace-outer');

        asyncContext.run(context2, () => {
          expect(getTraceId()).toBe('trace-inner');
        });

        expect(getTraceId()).toBe('trace-outer');
      });
    });
  });

  describe('getTimestamp', () => {
    it('should return timestamp from context when available', () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        timestamp: '2024-01-31T10:30:00.000Z',
      };

      asyncContext.run(context, () => {
        expect(getTimestamp()).toBe('2024-01-31T10:30:00.000Z');
      });
    });

    it('should return current timestamp when context is not available', () => {
      const timestamp = getTimestamp();
      const isValidISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp);
      expect(isValidISODate).toBe(true);
    });

    it('should return current timestamp when context exists but timestamp is missing', () => {
      const context = { traceId: 'test' } as RequestContext;

      asyncContext.run(context, () => {
        const timestamp = getTimestamp();
        const isValidISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp);
        expect(isValidISODate).toBe(true);
      });
    });

    it('should work correctly in nested contexts', () => {
      const context1: RequestContext = {
        traceId: 'trace1',
        timestamp: '2024-01-31T10:00:00.000Z',
      };

      const context2: RequestContext = {
        traceId: 'trace2',
        timestamp: '2024-01-31T11:00:00.000Z',
      };

      asyncContext.run(context1, () => {
        expect(getTimestamp()).toBe('2024-01-31T10:00:00.000Z');

        asyncContext.run(context2, () => {
          expect(getTimestamp()).toBe('2024-01-31T11:00:00.000Z');
        });

        expect(getTimestamp()).toBe('2024-01-31T10:00:00.000Z');
      });
    });
  });
});
