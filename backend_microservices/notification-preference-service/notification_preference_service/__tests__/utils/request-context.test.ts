import { getTraceId, runWithContext, getContext } from '../../src/utils/request-context';

describe('Request Context', () => {
  describe('runWithContext', () => {
    it('should create new context with trace ID', () => {
      runWithContext(() => {
        const traceId = getTraceId();
        expect(traceId).toBeDefined();
        expect(typeof traceId).toBe('string');
        expect(traceId).not.toBe('unknown');
      });
    });

    it('should generate unique trace IDs for different contexts', () => {
      let traceId1: string = '';
      let traceId2: string = '';

      runWithContext(() => {
        traceId1 = getTraceId();
      });

      runWithContext(() => {
        traceId2 = getTraceId();
      });

      expect(traceId1).not.toBe(traceId2);
    });

    it('should preserve trace ID within same context', () => {
      runWithContext(() => {
        const traceId1 = getTraceId();
        const traceId2 = getTraceId();
        expect(traceId1).toBe(traceId2);
      });
    });

    it('should return value from function', () => {
      const result = runWithContext(() => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('should return string value from function', () => {
      const result = runWithContext(() => {
        return 'test-value';
      });

      expect(result).toBe('test-value');
    });

    it('should return object from function', () => {
      const result = runWithContext(() => {
        return { key: 'value', traceId: getTraceId() };
      });

      expect(result.key).toBe('value');
      expect(result.traceId).toBeDefined();
    });

    it('should handle nested function calls', () => {
      runWithContext(() => {
        const outerTraceId = getTraceId();

        const innerFunction = (): string => {
          return getTraceId();
        };

        const innerTraceId = innerFunction();
        expect(innerTraceId).toBe(outerTraceId);
      });
    });

    it('should isolate contexts in nested runWithContext calls', () => {
      runWithContext(() => {
        const outerTraceId = getTraceId();

        runWithContext(() => {
          const innerTraceId = getTraceId();
          expect(innerTraceId).not.toBe(outerTraceId);
        });
      });
    });
  });

  describe('getTraceId', () => {
    it('should return "unknown" when called outside context', () => {
      const traceId = getTraceId();
      expect(traceId).toBe('unknown');
    });

    it('should return valid UUID format within context', () => {
      runWithContext(() => {
        const traceId = getTraceId();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(traceId).toMatch(uuidRegex);
      });
    });
  });

  describe('getContext', () => {
    it('should return undefined outside context', () => {
      const context = getContext();
      expect(context).toBeUndefined();
    });

    it('should return context object inside runWithContext', () => {
      runWithContext(() => {
        const context = getContext();
        expect(context).toBeDefined();
        expect(context?.traceId).toBeDefined();
      });
    });

    it('should have traceId property in context', () => {
      runWithContext(() => {
        const context = getContext();
        expect(context).toHaveProperty('traceId');
        expect(typeof context?.traceId).toBe('string');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle throwing errors within context', () => {
      expect(() => {
        runWithContext(() => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('should handle async operations', async () => {
      await runWithContext(async () => {
        const traceId1 = getTraceId();
        await Promise.resolve();
        const traceId2 = getTraceId();
        expect(traceId1).toBe(traceId2);
      });
    });

    it('should handle Promise return values', async () => {
      const result = await runWithContext(async () => {
        return Promise.resolve('async-value');
      });

      expect(result).toBe('async-value');
    });
  });
});
