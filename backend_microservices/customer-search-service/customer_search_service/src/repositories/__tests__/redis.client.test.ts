import Redis from 'ioredis';
import { RedisClient } from '../redis.client';
import { logger } from '../../utils/logger';

jest.mock('ioredis');
jest.mock('../../utils/logger');
jest.mock('../../config', () => ({
  config: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
    },
  },
}));

describe('RedisClient', () => {
  let redisClient: RedisClient;
  let mockRedis: jest.Mocked<Redis>;
  let eventHandlers: { [key: string]: Function };

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
      on: jest.fn((event, handler) => {
        eventHandlers[event] = handler;
        return mockRedis;
      }),
    } as any;

    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);

    redisClient = new RedisClient();
  });

  describe('constructor', () => {
    it('should create Redis client with correct configuration', () => {
      expect(Redis).toHaveBeenCalledWith({
        host: 'localhost',
        port: 6379,
        password: 'test-password',
        retryStrategy: expect.any(Function),
      });
    });

    it('should register error event handler', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should register connect event handler', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('should log error when error event occurs', () => {
      const errorHandler = eventHandlers['error'];
      const testError = new Error('Connection refused');

      errorHandler(testError);

      expect(logger.error).toHaveBeenCalledWith(
        { error: 'Connection refused' },
        'Redis client error'
      );
    });

    it('should log info when connect event occurs', () => {
      const connectHandler = eventHandlers['connect'];

      connectHandler();

      expect(logger.info).toHaveBeenCalledWith('Redis client connected');
    });

    it('should implement retry strategy with exponential backoff', () => {
      const calls = (Redis as any).mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      const config = calls[0]?.[0];
      expect(config).toBeDefined();
      expect(config.retryStrategy).toBeDefined();

      const retryStrategy = config.retryStrategy as (times: number) => number;

      expect(retryStrategy(1)).toBe(50);
      expect(retryStrategy(2)).toBe(100);
      expect(retryStrategy(10)).toBe(500);
      expect(retryStrategy(50)).toBe(2000);
      expect(retryStrategy(100)).toBe(2000);
    });

    it('should cap retry delay at 2000ms', () => {
      const calls = (Redis as any).mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      const config = calls[0]?.[0];
      const retryStrategy = config?.retryStrategy as (times: number) => number;

      expect(retryStrategy(1000)).toBe(2000);
    });
  });

  describe('get', () => {
    it('should retrieve value successfully', async () => {
      mockRedis.get.mockResolvedValue('test-value');

      const result = await redisClient.get('test-key');

      expect(result).toBe('test-value');
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisClient.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null and log error on failure', async () => {
      const testError = new Error('Redis GET failed');
      mockRedis.get.mockRejectedValue(testError);

      const result = await redisClient.get('test-key');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        { error: testError, key: 'test-key' },
        'Redis GET failed'
      );
    });

    it('should handle empty string values', async () => {
      mockRedis.get.mockResolvedValue('');

      const result = await redisClient.get('empty-key');

      expect(result).toBe('');
    });

    it('should handle JSON string values', async () => {
      const jsonValue = JSON.stringify({ id: 1, name: 'John' });
      mockRedis.get.mockResolvedValue(jsonValue);

      const result = await redisClient.get('json-key');

      expect(result).toBe(jsonValue);
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisClient.set('test-key', 'test-value');

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should set value with TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await redisClient.set('test-key', 'test-value', 60);

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 60, 'test-value');
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should set value with zero TTL as no TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisClient.set('test-key', 'test-value', 0);

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should log error on SET failure without TTL', async () => {
      const testError = new Error('Redis SET failed');
      mockRedis.set.mockRejectedValue(testError);

      await redisClient.set('test-key', 'test-value');

      expect(logger.error).toHaveBeenCalledWith(
        { error: testError, key: 'test-key' },
        'Redis SET failed'
      );
    });

    it('should log error on SET failure with TTL', async () => {
      const testError = new Error('Redis SETEX failed');
      mockRedis.setex.mockRejectedValue(testError);

      await redisClient.set('test-key', 'test-value', 60);

      expect(logger.error).toHaveBeenCalledWith(
        { error: testError, key: 'test-key' },
        'Redis SET failed'
      );
    });

    it('should not throw error on failure', async () => {
      mockRedis.set.mockRejectedValue(new Error('Connection lost'));

      await expect(redisClient.set('test-key', 'test-value')).resolves.toBeUndefined();
    });

    it('should handle empty string values', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisClient.set('empty-key', '');

      expect(mockRedis.set).toHaveBeenCalledWith('empty-key', '');
    });

    it('should handle JSON string values with TTL', async () => {
      const jsonValue = JSON.stringify({ id: 1, name: 'John' });
      mockRedis.setex.mockResolvedValue('OK');

      await redisClient.set('json-key', jsonValue, 120);

      expect(mockRedis.setex).toHaveBeenCalledWith('json-key', 120, jsonValue);
    });
  });

  describe('del', () => {
    it('should delete key successfully', async () => {
      mockRedis.del.mockResolvedValue(1);

      await redisClient.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle deletion of non-existent key', async () => {
      mockRedis.del.mockResolvedValue(0);

      await redisClient.del('non-existent-key');

      expect(mockRedis.del).toHaveBeenCalledWith('non-existent-key');
    });

    it('should log error and not throw on failure', async () => {
      const testError = new Error('Redis DEL failed');
      mockRedis.del.mockRejectedValue(testError);

      await redisClient.del('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        { error: testError, key: 'test-key' },
        'Redis DEL failed'
      );
    });

    it('should not throw error on failure', async () => {
      mockRedis.del.mockRejectedValue(new Error('Connection lost'));

      await expect(redisClient.del('test-key')).resolves.toBeUndefined();
    });
  });

  describe('healthCheck', () => {
    it('should return true when ping succeeds', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const isHealthy = await redisClient.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should return false when ping fails', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection refused'));

      const isHealthy = await redisClient.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should not throw error on health check failure', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Timeout'));

      await expect(redisClient.healthCheck()).resolves.toBe(false);
    });

    it('should handle various ping responses', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await redisClient.healthCheck();

      expect(result).toBe(true);
    });
  });

  describe('close', () => {
    it('should close Redis client', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await redisClient.close();

      expect(mockRedis.quit).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Redis client closed');
    });

    it('should handle close errors', async () => {
      const testError = new Error('Close failed');
      mockRedis.quit.mockRejectedValue(testError);

      await expect(redisClient.close()).rejects.toThrow('Close failed');
    });

    it('should log info message when close succeeds', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await redisClient.close();

      expect(logger.info).toHaveBeenCalledWith('Redis client closed');
    });
  });

  describe('integration scenarios', () => {
    it('should support get-set-delete workflow', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue('test-value');
      mockRedis.del.mockResolvedValue(1);

      await redisClient.set('key', 'test-value');
      const value = await redisClient.get('key');
      await redisClient.del('key');

      expect(value).toBe('test-value');
      expect(mockRedis.set).toHaveBeenCalled();
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should support caching with TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue('cached-value');

      await redisClient.set('cache-key', 'cached-value', 300);
      const value = await redisClient.get('cache-key');

      expect(value).toBe('cached-value');
    });

    it('should handle multiple concurrent operations', async () => {
      mockRedis.get.mockResolvedValue('value');
      mockRedis.set.mockResolvedValue('OK');

      const operations = [
        redisClient.get('key1'),
        redisClient.get('key2'),
        redisClient.set('key3', 'value3'),
      ];

      await Promise.all(operations);

      expect(mockRedis.get).toHaveBeenCalledTimes(2);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);
    });

    it('should continue operating after individual operation failures', async () => {
      mockRedis.set.mockRejectedValueOnce(new Error('First SET failed'));
      mockRedis.set.mockResolvedValueOnce('OK');

      await redisClient.set('key1', 'value1'); // Fails
      await redisClient.set('key2', 'value2'); // Succeeds

      expect(mockRedis.set).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle null errors', async () => {
      mockRedis.get.mockRejectedValue(null);

      const result = await redisClient.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle undefined errors', async () => {
      mockRedis.get.mockRejectedValue(undefined);

      const result = await redisClient.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle non-Error objects', async () => {
      mockRedis.get.mockRejectedValue('String error');

      const result = await redisClient.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('data type handling', () => {
    it('should handle large string values', async () => {
      const largeValue = 'x'.repeat(10000);
      mockRedis.set.mockResolvedValue('OK');

      await redisClient.set('large-key', largeValue);

      expect(mockRedis.set).toHaveBeenCalledWith('large-key', largeValue);
    });

    it('should handle special characters in keys', async () => {
      mockRedis.get.mockResolvedValue('value');

      await redisClient.get('key:with:colons');
      await redisClient.get('key-with-dashes');
      await redisClient.get('key_with_underscores');

      expect(mockRedis.get).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters in values', async () => {
      const specialValue = 'value\nwith\nnewlines\tand\ttabs';
      mockRedis.set.mockResolvedValue('OK');

      await redisClient.set('special-key', specialValue);

      expect(mockRedis.set).toHaveBeenCalledWith('special-key', specialValue);
    });
  });

  describe('module exports', () => {
    it('should export redisClient singleton', () => {
      const { redisClient: exportedClient } = require('../redis.client');

      expect(exportedClient).toBeInstanceOf(RedisClient);
    });

    it('should export RedisClient class', () => {
      const { RedisClient: ExportedClass } = require('../redis.client');

      expect(ExportedClass).toBeDefined();
      expect(new ExportedClass()).toBeInstanceOf(RedisClient);
    });
  });

  describe('lifecycle', () => {
    it('should support complete lifecycle', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue('value');
      mockRedis.quit.mockResolvedValue('OK');

      // Health check
      const isHealthy = await redisClient.healthCheck();
      expect(isHealthy).toBe(true);

      // Operations
      await redisClient.set('key', 'value');
      await redisClient.get('key');

      // Cleanup
      await redisClient.close();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should handle multiple error events', () => {
      const errorHandler = eventHandlers['error'];

      errorHandler(new Error('Error 1'));
      errorHandler(new Error('Error 2'));

      expect(logger.error).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple connect events', () => {
      const connectHandler = eventHandlers['connect'];

      connectHandler();
      connectHandler();

      expect(logger.info).toHaveBeenCalledTimes(2);
    });
  });
});
