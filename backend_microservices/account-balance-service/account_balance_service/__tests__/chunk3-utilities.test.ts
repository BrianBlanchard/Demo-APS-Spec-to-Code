import { asyncLocalStorage } from '../src/utils/async-context';
import { RequestContext } from '../src/types/context.types';

describe('Chunk 3: Utilities / Helpers', () => {
  describe('AsyncLocalStorage Context', () => {
    it('should store and retrieve context within async scope', async () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        userId: 'user-123',
        timestamp: new Date(),
      };

      await asyncLocalStorage.run(context, async () => {
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved).toBeDefined();
        expect(retrieved?.traceId).toBe('test-trace-id');
        expect(retrieved?.userId).toBe('user-123');
      });
    });

    it('should return undefined outside of async scope', () => {
      const retrieved = asyncLocalStorage.getStore();
      expect(retrieved).toBeUndefined();
    });

    it('should maintain context through async operations', async () => {
      const context: RequestContext = {
        traceId: 'async-trace-id',
        timestamp: new Date(),
      };

      await asyncLocalStorage.run(context, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved?.traceId).toBe('async-trace-id');
      });
    });

    it('should isolate context between concurrent async operations', async () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: new Date(),
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: new Date(),
      };

      const promise1 = asyncLocalStorage.run(context1, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved?.traceId).toBe('trace-1');
      });

      const promise2 = asyncLocalStorage.run(context2, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved?.traceId).toBe('trace-2');
      });

      await Promise.all([promise1, promise2]);
    });

    it('should handle nested async operations with same context', async () => {
      const context: RequestContext = {
        traceId: 'nested-trace',
        timestamp: new Date(),
      };

      await asyncLocalStorage.run(context, async () => {
        const level1 = asyncLocalStorage.getStore();
        expect(level1?.traceId).toBe('nested-trace');

        await (async () => {
          const level2 = asyncLocalStorage.getStore();
          expect(level2?.traceId).toBe('nested-trace');
          expect(level2).toBe(level1);
        })();
      });
    });

    it('should allow optional userId in context', async () => {
      const context: RequestContext = {
        traceId: 'trace-no-user',
        timestamp: new Date(),
      };

      await asyncLocalStorage.run(context, async () => {
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved?.traceId).toBe('trace-no-user');
        expect(retrieved?.userId).toBeUndefined();
      });
    });

    it('should store timestamp in context', async () => {
      const timestamp = new Date('2024-01-15T14:30:00Z');
      const context: RequestContext = {
        traceId: 'trace-with-time',
        timestamp,
      };

      await asyncLocalStorage.run(context, async () => {
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved?.timestamp).toEqual(timestamp);
      });
    });

    it('should clear context after async operation completes', async () => {
      const context: RequestContext = {
        traceId: 'temp-trace',
        timestamp: new Date(),
      };

      await asyncLocalStorage.run(context, async () => {
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved).toBeDefined();
      });

      const outsideContext = asyncLocalStorage.getStore();
      expect(outsideContext).toBeUndefined();
    });
  });

  describe('RequestContext Type', () => {
    it('should create valid RequestContext with required fields', () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        timestamp: new Date(),
      };

      expect(context.traceId).toBe('test-trace');
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.userId).toBeUndefined();
    });

    it('should create valid RequestContext with optional userId', () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        userId: 'user-456',
        timestamp: new Date(),
      };

      expect(context.traceId).toBe('test-trace');
      expect(context.userId).toBe('user-456');
    });

    it('should accept any string for traceId', () => {
      const contexts: RequestContext[] = [
        { traceId: 'simple-id', timestamp: new Date() },
        { traceId: '550e8400-e29b-41d4-a716-446655440000', timestamp: new Date() },
        { traceId: 'trace_123_abc', timestamp: new Date() },
      ];

      contexts.forEach((context) => {
        expect(typeof context.traceId).toBe('string');
        expect(context.traceId.length).toBeGreaterThan(0);
      });
    });
  });
});
