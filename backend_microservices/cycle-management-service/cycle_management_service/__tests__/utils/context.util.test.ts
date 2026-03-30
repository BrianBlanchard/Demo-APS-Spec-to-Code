import { createContext, getContext, getTraceId, asyncLocalStorage } from '../../src/utils/context.util';

describe('Context Utility', () => {
  describe('createContext', () => {
    it('should create context with provided traceId', () => {
      const traceId = 'test-trace-id-123';
      const context = createContext(traceId);

      expect(context.traceId).toBe(traceId);
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should create context with generated UUID when no traceId provided', () => {
      const context = createContext();

      expect(context.traceId).toBeDefined();
      expect(context.traceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should create different UUIDs for multiple calls', () => {
      const context1 = createContext();
      const context2 = createContext();

      expect(context1.traceId).not.toBe(context2.traceId);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const context = createContext();
      const after = new Date();

      expect(context.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(context.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getContext', () => {
    it('should return undefined when no context is set', () => {
      const context = getContext();
      expect(context).toBeUndefined();
    });

    it('should return context when running inside asyncLocalStorage', () => {
      const testContext = createContext('test-123');

      asyncLocalStorage.run(testContext, () => {
        const retrievedContext = getContext();
        expect(retrievedContext).toBe(testContext);
        expect(retrievedContext?.traceId).toBe('test-123');
      });
    });

    it('should return undefined after exiting asyncLocalStorage scope', () => {
      const testContext = createContext('test-456');

      asyncLocalStorage.run(testContext, () => {
        // Inside scope
      });

      // Outside scope
      const retrievedContext = getContext();
      expect(retrievedContext).toBeUndefined();
    });
  });

  describe('getTraceId', () => {
    it('should return "no-trace-id" when no context is set', () => {
      const traceId = getTraceId();
      expect(traceId).toBe('no-trace-id');
    });

    it('should return traceId from context when available', () => {
      const testContext = createContext('my-trace-id');

      asyncLocalStorage.run(testContext, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('my-trace-id');
      });
    });

    it('should return different traceIds for nested contexts', () => {
      const outerContext = createContext('outer-trace');
      const innerContext = createContext('inner-trace');

      asyncLocalStorage.run(outerContext, () => {
        expect(getTraceId()).toBe('outer-trace');

        asyncLocalStorage.run(innerContext, () => {
          expect(getTraceId()).toBe('inner-trace');
        });

        expect(getTraceId()).toBe('outer-trace');
      });
    });
  });
});
