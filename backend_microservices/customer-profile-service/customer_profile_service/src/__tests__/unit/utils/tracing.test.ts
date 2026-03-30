import {
  generateTraceId,
  getTraceId,
  getUserId,
  getIpAddress,
  runWithTracing,
  TracingContext,
} from '../../../utils/tracing';

describe('Tracing Utilities', () => {
  describe('generateTraceId', () => {
    it('should generate a valid UUID', () => {
      const traceId = generateTraceId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(traceId).toMatch(uuidRegex);
    });

    it('should generate unique trace IDs', () => {
      const traceId1 = generateTraceId();
      const traceId2 = generateTraceId();
      const traceId3 = generateTraceId();

      expect(traceId1).not.toBe(traceId2);
      expect(traceId2).not.toBe(traceId3);
      expect(traceId1).not.toBe(traceId3);
    });

    it('should generate trace IDs of correct length', () => {
      const traceId = generateTraceId();
      expect(traceId.length).toBe(36); // UUID v4 format length
    });

    it('should generate multiple unique trace IDs in sequence', () => {
      const traceIds = new Set<string>();
      for (let i = 0; i < 100; i++) {
        traceIds.add(generateTraceId());
      }
      expect(traceIds.size).toBe(100);
    });
  });

  describe('runWithTracing', () => {
    it('should execute function within tracing context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
        ipAddress: '192.168.1.1',
      };

      const result = runWithTracing(context, () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should make trace ID available within context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
        ipAddress: '192.168.1.1',
      };

      runWithTracing(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('trace-123');
      });
    });

    it('should make user ID available within context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
        ipAddress: '192.168.1.1',
      };

      runWithTracing(context, () => {
        const userId = getUserId();
        expect(userId).toBe('user-456');
      });
    });

    it('should make IP address available within context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
        ipAddress: '192.168.1.1',
      };

      runWithTracing(context, () => {
        const ipAddress = getIpAddress();
        expect(ipAddress).toBe('192.168.1.1');
      });
    });

    it('should isolate context between different runs', () => {
      const context1: TracingContext = {
        traceId: 'trace-111',
        userId: 'user-111',
        ipAddress: '192.168.1.1',
      };

      const context2: TracingContext = {
        traceId: 'trace-222',
        userId: 'user-222',
        ipAddress: '192.168.1.2',
      };

      let traceId1: string | undefined;
      let traceId2: string | undefined;

      runWithTracing(context1, () => {
        traceId1 = getTraceId();
      });

      runWithTracing(context2, () => {
        traceId2 = getTraceId();
      });

      expect(traceId1).toBe('trace-111');
      expect(traceId2).toBe('trace-222');
    });

    it('should handle context without optional fields', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      runWithTracing(context, () => {
        const traceId = getTraceId();
        const userId = getUserId();
        const ipAddress = getIpAddress();

        expect(traceId).toBe('trace-123');
        expect(userId).toBeUndefined();
        expect(ipAddress).toBeUndefined();
      });
    });

    it('should preserve return value from function', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      const result = runWithTracing(context, () => {
        return { success: true, data: 'test' };
      });

      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should handle async functions', async () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
      };

      const result = await runWithTracing(context, async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve('async-result');
          }, 10);
        });
      });

      expect(result).toBe('async-result');
    });

    it('should handle exceptions within context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      expect(() => {
        runWithTracing(context, () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('should handle nested tracing contexts', () => {
      const outerContext: TracingContext = {
        traceId: 'outer-trace',
        userId: 'outer-user',
      };

      const innerContext: TracingContext = {
        traceId: 'inner-trace',
        userId: 'inner-user',
      };

      runWithTracing(outerContext, () => {
        const outerTraceId = getTraceId();
        expect(outerTraceId).toBe('outer-trace');

        runWithTracing(innerContext, () => {
          const innerTraceId = getTraceId();
          expect(innerTraceId).toBe('inner-trace');
        });

        // After inner context, outer context should still be accessible
        const outerTraceIdAfter = getTraceId();
        expect(outerTraceIdAfter).toBe('outer-trace');
      });
    });
  });

  describe('getTraceId', () => {
    it('should return undefined when called outside tracing context', () => {
      const traceId = getTraceId();
      expect(traceId).toBeUndefined();
    });

    it('should return trace ID when called inside tracing context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      runWithTracing(context, () => {
        const traceId = getTraceId();
        expect(traceId).toBe('trace-123');
      });
    });
  });

  describe('getUserId', () => {
    it('should return undefined when called outside tracing context', () => {
      const userId = getUserId();
      expect(userId).toBeUndefined();
    });

    it('should return user ID when called inside tracing context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
      };

      runWithTracing(context, () => {
        const userId = getUserId();
        expect(userId).toBe('user-456');
      });
    });

    it('should return undefined when user ID not set in context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      runWithTracing(context, () => {
        const userId = getUserId();
        expect(userId).toBeUndefined();
      });
    });
  });

  describe('getIpAddress', () => {
    it('should return undefined when called outside tracing context', () => {
      const ipAddress = getIpAddress();
      expect(ipAddress).toBeUndefined();
    });

    it('should return IP address when called inside tracing context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        ipAddress: '10.0.0.1',
      };

      runWithTracing(context, () => {
        const ipAddress = getIpAddress();
        expect(ipAddress).toBe('10.0.0.1');
      });
    });

    it('should return undefined when IP address not set in context', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      runWithTracing(context, () => {
        const ipAddress = getIpAddress();
        expect(ipAddress).toBeUndefined();
      });
    });
  });

  describe('TracingContext interface', () => {
    it('should create context with all fields', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
        ipAddress: '192.168.1.1',
      };

      expect(context.traceId).toBe('trace-123');
      expect(context.userId).toBe('user-456');
      expect(context.ipAddress).toBe('192.168.1.1');
    });

    it('should create context with only required fields', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
      };

      expect(context.traceId).toBe('trace-123');
      expect(context.userId).toBeUndefined();
      expect(context.ipAddress).toBeUndefined();
    });

    it('should support different trace ID formats', () => {
      const uuidTrace: TracingContext = {
        traceId: generateTraceId(),
      };

      const customTrace: TracingContext = {
        traceId: 'custom-trace-id-123',
      };

      expect(uuidTrace.traceId).toBeDefined();
      expect(customTrace.traceId).toBe('custom-trace-id-123');
    });
  });

  describe('Tracing Integration', () => {
    it('should support complete request tracing flow', () => {
      const traceId = generateTraceId();
      const context: TracingContext = {
        traceId,
        userId: 'user-123',
        ipAddress: '192.168.1.1',
      };

      const result = runWithTracing(context, () => {
        const currentTraceId = getTraceId();
        const currentUserId = getUserId();
        const currentIpAddress = getIpAddress();

        return {
          traceId: currentTraceId,
          userId: currentUserId,
          ipAddress: currentIpAddress,
        };
      });

      expect(result.traceId).toBe(traceId);
      expect(result.userId).toBe('user-123');
      expect(result.ipAddress).toBe('192.168.1.1');
    });

    it('should maintain context across multiple function calls', () => {
      const context: TracingContext = {
        traceId: 'trace-123',
        userId: 'user-456',
      };

      runWithTracing(context, () => {
        const traceId1 = getTraceId();
        const traceId2 = getTraceId();
        const traceId3 = getTraceId();

        expect(traceId1).toBe('trace-123');
        expect(traceId2).toBe('trace-123');
        expect(traceId3).toBe('trace-123');
      });
    });

    it('should support parallel context execution', () => {
      const context1: TracingContext = {
        traceId: 'trace-111',
      };

      const context2: TracingContext = {
        traceId: 'trace-222',
      };

      const promise1 = Promise.resolve(
        runWithTracing(context1, () => getTraceId())
      );

      const promise2 = Promise.resolve(
        runWithTracing(context2, () => getTraceId())
      );

      return Promise.all([promise1, promise2]).then(([id1, id2]) => {
        // Note: In actual async scenarios, AsyncLocalStorage maintains separate contexts
        expect(id1).toBe('trace-111');
        expect(id2).toBe('trace-222');
      });
    });
  });
});
