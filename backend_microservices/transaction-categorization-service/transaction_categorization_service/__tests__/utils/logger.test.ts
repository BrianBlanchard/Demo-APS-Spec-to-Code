import logger, { requestContextStorage } from '../../src/utils/logger';
import type { RequestContext } from '../../src/types/request-context.types';

describe('Logger Utility', () => {
  describe('Logger instance', () => {
    it('should create a logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should have standard log methods', () => {
      const methods = ['info', 'error', 'warn', 'debug', 'fatal', 'trace'];

      methods.forEach((method) => {
        expect(typeof logger[method as keyof typeof logger]).toBe('function');
      });
    });
  });

  describe('AsyncLocalStorage', () => {
    it('should provide requestContextStorage instance', () => {
      expect(requestContextStorage).toBeDefined();
      expect(typeof requestContextStorage.run).toBe('function');
      expect(typeof requestContextStorage.getStore).toBe('function');
    });

    it('should store and retrieve request context', () => {
      const context: RequestContext = {
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      requestContextStorage.run(context, () => {
        const storedContext = requestContextStorage.getStore();
        expect(storedContext).toBeDefined();
        expect(storedContext?.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
        expect(storedContext?.timestamp).toBe('2024-01-15T10:30:00.000Z');
      });
    });

    it('should return undefined when no context is set', () => {
      const storedContext = requestContextStorage.getStore();
      expect(storedContext).toBeUndefined();
    });

    it('should isolate contexts in nested runs', () => {
      const context1: RequestContext = {
        traceId: 'trace-1',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      const context2: RequestContext = {
        traceId: 'trace-2',
        timestamp: '2024-01-15T10:31:00.000Z',
      };

      requestContextStorage.run(context1, () => {
        expect(requestContextStorage.getStore()?.traceId).toBe('trace-1');

        requestContextStorage.run(context2, () => {
          expect(requestContextStorage.getStore()?.traceId).toBe('trace-2');
        });

        expect(requestContextStorage.getStore()?.traceId).toBe('trace-1');
      });
    });

    it('should handle multiple sequential contexts', () => {
      const contexts = [
        { traceId: 'trace-1', timestamp: '2024-01-15T10:30:00.000Z' },
        { traceId: 'trace-2', timestamp: '2024-01-15T10:31:00.000Z' },
        { traceId: 'trace-3', timestamp: '2024-01-15T10:32:00.000Z' },
      ];

      contexts.forEach((context) => {
        requestContextStorage.run(context, () => {
          const stored = requestContextStorage.getStore();
          expect(stored?.traceId).toBe(context.traceId);
          expect(stored?.timestamp).toBe(context.timestamp);
        });
      });
    });
  });

  describe('Logger with context', () => {
    it('should log without context when context is not set', () => {
      // Should not throw error when logging without context
      expect(() => {
        logger.info('Test message without context');
      }).not.toThrow();
    });

    it('should log with context when context is set', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          logger.info({ test: 'data' }, 'Test message with context');
        }).not.toThrow();
      });
    });

    it('should handle different log levels', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          logger.debug('Debug message');
          logger.info('Info message');
          logger.warn('Warn message');
          logger.error('Error message');
        }).not.toThrow();
      });
    });

    it('should log objects with context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          logger.info({ mcc: '5411', category: 'Grocery' }, 'Category found');
        }).not.toThrow();
      });
    });

    it('should log errors with context', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      const error = new Error('Test error');

      requestContextStorage.run(context, () => {
        expect(() => {
          logger.error({ err: error }, 'An error occurred');
        }).not.toThrow();
      });
    });
  });

  describe('Logger configuration', () => {
    it('should use configured log level from environment', () => {
      // Logger uses process.env.LOG_LEVEL or defaults to 'info'
      const currentLogLevel = process.env.LOG_LEVEL || 'info';
      expect(['debug', 'info', 'warn', 'error', 'fatal', 'trace']).toContain(currentLogLevel);
    });

    it('should create logger with proper configuration', () => {
      // Verify logger is properly configured
      expect(logger.level).toBeDefined();
      expect(typeof logger.level).toBe('string');
    });
  });

  describe('Context propagation', () => {
    it('should propagate context through async operations', async () => {
      const context: RequestContext = {
        traceId: 'async-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      await new Promise<void>((resolve) => {
        requestContextStorage.run(context, async () => {
          await new Promise((r) => setTimeout(r, 10));

          const storedContext = requestContextStorage.getStore();
          expect(storedContext?.traceId).toBe('async-trace-id');

          resolve();
        });
      });
    });

    it('should maintain context across promise chains', async () => {
      const context: RequestContext = {
        traceId: 'promise-trace-id',
        timestamp: '2024-01-15T10:30:00.000Z',
      };

      await new Promise<void>((resolve) => {
        requestContextStorage.run(context, () => {
          Promise.resolve()
            .then(() => {
              const storedContext = requestContextStorage.getStore();
              expect(storedContext?.traceId).toBe('promise-trace-id');
            })
            .then(() => {
              const storedContext = requestContextStorage.getStore();
              expect(storedContext?.traceId).toBe('promise-trace-id');
              resolve();
            });
        });
      });
    });
  });
});
