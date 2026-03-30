import { setRequestContext, getRequestContext, asyncLocalStorage } from '../async-context.config';
import { RequestContext } from '../../types/context.types';

describe('Async Context Config', () => {
  beforeEach(() => {
    // Clear context before each test
  });

  describe('setRequestContext', () => {
    it('should set request context', () => {
      const context: RequestContext = {
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      const retrievedContext = getRequestContext();
      expect(retrievedContext).toEqual(context);
    });

    it('should update existing context', () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-01-15T10:30:00Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-01-15T10:31:00Z',
      };

      setRequestContext(context1);
      setRequestContext(context2);

      const retrievedContext = getRequestContext();
      expect(retrievedContext).toEqual(context2);
    });

    it('should persist context across async operations', async () => {
      const context: RequestContext = {
        traceId: 'async-trace-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const retrievedContext = getRequestContext();
      expect(retrievedContext).toEqual(context);
    });

    it('should handle multiple contexts in different async contexts', (done) => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-01-15T10:30:00Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-01-15T10:31:00Z',
      };

      asyncLocalStorage.run(context1, () => {
        const retrieved1 = getRequestContext();
        expect(retrieved1).toEqual(context1);

        asyncLocalStorage.run(context2, () => {
          const retrieved2 = getRequestContext();
          expect(retrieved2).toEqual(context2);
          done();
        });
      });
    });
  });

  describe('getRequestContext', () => {
    it('should return context from current async storage', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      asyncLocalStorage.run(context, () => {
        const retrieved = getRequestContext();
        expect(retrieved).toEqual(context);
      });
    });

    it('should return current context when set', () => {
      const context: RequestContext = {
        traceId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      const retrievedContext = getRequestContext();
      expect(retrievedContext).toEqual(context);
    });

    it('should return context with traceId', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      const retrievedContext = getRequestContext();
      expect(retrievedContext?.traceId).toBe('test-trace-id');
    });

    it('should return context with timestamp', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      const retrievedContext = getRequestContext();
      expect(retrievedContext?.timestamp).toBe('2024-01-15T10:30:00Z');
    });

    it('should maintain context across promise chains', async () => {
      const context: RequestContext = {
        traceId: 'promise-chain-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      await Promise.resolve()
        .then(() => {
          expect(getRequestContext()).toEqual(context);
        })
        .then(() => {
          expect(getRequestContext()).toEqual(context);
        });
    });

    it('should maintain context in nested async functions', async () => {
      const context: RequestContext = {
        traceId: 'nested-async-id',
        timestamp: '2024-01-15T10:30:00Z',
      };

      setRequestContext(context);

      const nestedAsync = async (): Promise<RequestContext | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return getRequestContext();
      };

      const result = await nestedAsync();
      expect(result).toEqual(context);
    });
  });

  describe('asyncLocalStorage', () => {
    it('should be an instance of AsyncLocalStorage', () => {
      expect(asyncLocalStorage).toBeDefined();
      expect(typeof asyncLocalStorage.run).toBe('function');
      expect(typeof asyncLocalStorage.getStore).toBe('function');
    });

    it('should isolate context between different runs', (done) => {
      const context1: RequestContext = {
        traceId: 'run-1',
        timestamp: '2024-01-15T10:30:00Z',
      };

      const context2: RequestContext = {
        traceId: 'run-2',
        timestamp: '2024-01-15T10:31:00Z',
      };

      let retrieved1: RequestContext | undefined;
      let retrieved2: RequestContext | undefined;

      asyncLocalStorage.run(context1, () => {
        retrieved1 = getRequestContext();
      });

      asyncLocalStorage.run(context2, () => {
        retrieved2 = getRequestContext();
      });

      expect(retrieved1?.traceId).toBe('run-1');
      expect(retrieved2?.traceId).toBe('run-2');
      done();
    });
  });
});
