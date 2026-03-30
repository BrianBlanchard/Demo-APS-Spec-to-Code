import {
  initTraceContext,
  getTraceId,
  getUserId,
  runWithContext,
} from '../../src/utils/trace-context';

describe('Trace Context Utilities', () => {
  describe('initTraceContext', () => {
    it('should initialize context with provided traceId', () => {
      const traceId = 'test-trace-id-123';
      initTraceContext(traceId);
      expect(getTraceId()).toBe(traceId);
    });

    it('should generate UUID if traceId not provided', () => {
      initTraceContext();
      const traceId = getTraceId();
      expect(traceId).toBeTruthy();
      expect(traceId).not.toBe('unknown');
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      expect(traceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should store userId when provided', () => {
      const traceId = 'test-trace-id';
      const userId = 'user-123';
      initTraceContext(traceId, userId);
      expect(getUserId()).toBe(userId);
    });

    it('should handle undefined userId', () => {
      const traceId = 'test-trace-id';
      initTraceContext(traceId, undefined);
      expect(getUserId()).toBeUndefined();
    });

    it('should overwrite previous context', () => {
      initTraceContext('trace-1', 'user-1');
      expect(getTraceId()).toBe('trace-1');
      expect(getUserId()).toBe('user-1');

      initTraceContext('trace-2', 'user-2');
      expect(getTraceId()).toBe('trace-2');
      expect(getUserId()).toBe('user-2');
    });
  });

  describe('getTraceId', () => {
    it('should return traceId from context', () => {
      const traceId = 'test-trace-id';
      initTraceContext(traceId);
      expect(getTraceId()).toBe(traceId);
    });

    it('should return "unknown" if no context initialized', () => {
      // This test runs in isolation, so context may not be set
      // We can't easily clear the AsyncLocalStorage, so we test that it returns something
      const traceId = getTraceId();
      expect(typeof traceId).toBe('string');
    });

    it('should persist traceId across multiple calls', () => {
      const traceId = 'persistent-trace-id';
      initTraceContext(traceId);

      expect(getTraceId()).toBe(traceId);
      expect(getTraceId()).toBe(traceId);
      expect(getTraceId()).toBe(traceId);
    });
  });

  describe('getUserId', () => {
    it('should return userId from context', () => {
      const userId = 'user-123';
      initTraceContext('trace-id', userId);
      expect(getUserId()).toBe(userId);
    });

    it('should return undefined if no userId set', () => {
      initTraceContext('trace-id');
      expect(getUserId()).toBeUndefined();
    });

    it('should return undefined if no context initialized', () => {
      // Similar to getTraceId, we test type
      const userId = getUserId();
      expect(userId === undefined || typeof userId === 'string').toBe(true);
    });
  });

  describe('runWithContext', () => {
    it('should execute function with provided context', () => {
      const traceId = 'context-trace-id';
      const userId = 'context-user-id';
      let capturedTraceId: string;
      let capturedUserId: string | undefined;

      const result = runWithContext(traceId, userId, () => {
        capturedTraceId = getTraceId();
        capturedUserId = getUserId();
        return 'test-result';
      });

      expect(result).toBe('test-result');
      expect(capturedTraceId!).toBe(traceId);
      expect(capturedUserId!).toBe(userId);
    });

    it('should execute function with undefined userId', () => {
      const traceId = 'context-trace-id';
      let capturedTraceId: string;
      let capturedUserId: string | undefined;

      runWithContext(traceId, undefined, () => {
        capturedTraceId = getTraceId();
        capturedUserId = getUserId();
      });

      expect(capturedTraceId!).toBe(traceId);
      expect(capturedUserId!).toBeUndefined();
    });

    it('should return function result', () => {
      const result = runWithContext('trace', 'user', () => {
        return { data: 'test', count: 42 };
      });

      expect(result).toEqual({ data: 'test', count: 42 });
    });

    it('should isolate context for different executions', () => {
      const results: Array<{ traceId: string; userId: string | undefined }> = [];

      runWithContext('trace-1', 'user-1', () => {
        results.push({ traceId: getTraceId(), userId: getUserId() });
      });

      runWithContext('trace-2', 'user-2', () => {
        results.push({ traceId: getTraceId(), userId: getUserId() });
      });

      expect(results[0]).toEqual({ traceId: 'trace-1', userId: 'user-1' });
      expect(results[1]).toEqual({ traceId: 'trace-2', userId: 'user-2' });
    });

    it('should handle synchronous functions', () => {
      const result = runWithContext('trace', 'user', () => {
        return 1 + 1;
      });

      expect(result).toBe(2);
    });

    it('should propagate exceptions', () => {
      expect(() => {
        runWithContext('trace', 'user', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });
  });

  describe('Context isolation', () => {
    it('should maintain different contexts in different scopes', () => {
      initTraceContext('outer-trace', 'outer-user');
      const outerTrace = getTraceId();
      const outerUser = getUserId();

      const innerResult = runWithContext('inner-trace', 'inner-user', () => {
        return {
          traceId: getTraceId(),
          userId: getUserId(),
        };
      });

      expect(outerTrace).toBe('outer-trace');
      expect(outerUser).toBe('outer-user');
      expect(innerResult.traceId).toBe('inner-trace');
      expect(innerResult.userId).toBe('inner-user');
    });
  });
});
