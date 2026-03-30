import { asyncLocalStorage, getRequestContext, getTraceId, RequestContext } from '../async-local-storage';

describe('Async Local Storage', () => {
  describe('asyncLocalStorage', () => {
    it('should be an instance of AsyncLocalStorage', () => {
      expect(asyncLocalStorage).toBeDefined();
      expect(asyncLocalStorage.run).toBeDefined();
      expect(asyncLocalStorage.getStore).toBeDefined();
    });

    it('should store and retrieve context within async scope', (done) => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(context, () => {
        const retrieved = asyncLocalStorage.getStore();
        expect(retrieved).toEqual(context);
        done();
      });
    });

    it('should isolate context between different async scopes', async () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-03-27T14:00:00Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-03-27T15:00:00Z',
      };

      const promise1 = new Promise<string>((resolve) => {
        asyncLocalStorage.run(context1, () => {
          setTimeout(() => {
            const ctx = asyncLocalStorage.getStore();
            resolve(ctx?.traceId || 'none');
          }, 10);
        });
      });

      const promise2 = new Promise<string>((resolve) => {
        asyncLocalStorage.run(context2, () => {
          setTimeout(() => {
            const ctx = asyncLocalStorage.getStore();
            resolve(ctx?.traceId || 'none');
          }, 10);
        });
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('trace-1');
      expect(result2).toBe('trace-2');
    });
  });

  describe('getRequestContext', () => {
    it('should return undefined when no context is set', () => {
      const context = getRequestContext();

      expect(context).toBeUndefined();
    });

    it('should return context when set', (done) => {
      const expectedContext: RequestContext = {
        traceId: 'test-trace-456',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(expectedContext, () => {
        const context = getRequestContext();
        expect(context).toEqual(expectedContext);
        done();
      });
    });

    it('should preserve context through nested calls', (done) => {
      const context: RequestContext = {
        traceId: 'nested-trace',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(context, () => {
        const level1 = getRequestContext();

        setTimeout(() => {
          const level2 = getRequestContext();
          expect(level1).toEqual(context);
          expect(level2).toEqual(context);
          done();
        }, 5);
      });
    });

    it('should return complete context object', (done) => {
      const context: RequestContext = {
        traceId: 'complete-trace-789',
        timestamp: '2024-03-27T16:45:30Z',
      };

      asyncLocalStorage.run(context, () => {
        const retrieved = getRequestContext();
        expect(retrieved).toBeDefined();
        expect(retrieved?.traceId).toBe('complete-trace-789');
        expect(retrieved?.timestamp).toBe('2024-03-27T16:45:30Z');
        done();
      });
    });
  });

  describe('getTraceId', () => {
    it('should return "unknown" when no context is set', () => {
      const traceId = getTraceId();

      expect(traceId).toBe('unknown');
    });

    it('should return trace ID when context is set', (done) => {
      const context: RequestContext = {
        traceId: 'my-trace-id',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('my-trace-id');
        done();
      });
    });

    it('should return "unknown" for undefined context', () => {
      asyncLocalStorage.run(undefined as any, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('unknown');
      });
    });

    it('should preserve trace ID through async operations', async () => {
      const context: RequestContext = {
        traceId: 'async-trace-123',
        timestamp: '2024-03-27T14:30:05Z',
      };

      const result = await new Promise<string>((resolve) => {
        asyncLocalStorage.run(context, async () => {
          await new Promise(r => setTimeout(r, 10));
          const traceId = getTraceId();
          resolve(traceId);
        });
      });

      expect(result).toBe('async-trace-123');
    });

    it('should return "unknown" for empty trace ID', (done) => {
      const context: RequestContext = {
        traceId: '',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('unknown');
        done();
      });
    });

    it('should handle special characters in trace ID', (done) => {
      const context: RequestContext = {
        traceId: 'trace-with-dashes-and_underscores_123',
        timestamp: '2024-03-27T14:30:05Z',
      };

      asyncLocalStorage.run(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('trace-with-dashes-and_underscores_123');
        done();
      });
    });
  });

  describe('RequestContext type', () => {
    it('should enforce traceId property', () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        timestamp: '2024-03-27T14:30:05Z',
      };

      expect(context.traceId).toBe('test-trace');
      expect(typeof context.traceId).toBe('string');
    });

    it('should enforce timestamp property', () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        timestamp: '2024-03-27T14:30:05Z',
      };

      expect(context.timestamp).toBe('2024-03-27T14:30:05Z');
      expect(typeof context.timestamp).toBe('string');
    });
  });

  describe('Concurrent request handling', () => {
    it('should handle multiple concurrent requests with different trace IDs', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        traceId: `trace-${i}`,
        timestamp: new Date().toISOString(),
      }));

      const results = await Promise.all(
        requests.map((context) =>
          new Promise<string>((resolve) => {
            asyncLocalStorage.run(context, async () => {
              await new Promise(r => setTimeout(r, Math.random() * 20));
              const traceId = getTraceId();
              resolve(traceId);
            });
          })
        )
      );

      requests.forEach((context, i) => {
        expect(results[i]).toBe(context.traceId);
      });
    });

    it('should maintain context isolation under load', async () => {
      const iterations = 100;
      const promises: Promise<boolean>[] = [];

      for (let i = 0; i < iterations; i++) {
        const expectedTraceId = `load-test-${i}`;
        const context: RequestContext = {
          traceId: expectedTraceId,
          timestamp: new Date().toISOString(),
        };

        const promise = new Promise<boolean>((resolve) => {
          asyncLocalStorage.run(context, () => {
            setImmediate(() => {
              const actualTraceId = getTraceId();
              resolve(actualTraceId === expectedTraceId);
            });
          });
        });

        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const allCorrect = results.every(r => r === true);

      expect(allCorrect).toBe(true);
    });
  });
});
