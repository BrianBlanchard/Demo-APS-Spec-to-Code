import { CacheService } from '../cache.service';
import { RedisClient } from '../../repositories/redis.client';
import { logger } from '../../utils/logger';

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedisClient: jest.Mocked<RedisClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Redis client
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<RedisClient>;

    cacheService = new CacheService(mockRedisClient);
  });

  describe('constructor', () => {
    it('should create instance with default redis client', () => {
      const service = new CacheService();
      expect(service).toBeInstanceOf(CacheService);
    });
  });

  describe('get', () => {
    it('should return parsed value on cache hit', async () => {
      const key = 'test:key';
      const value = { data: 'test', count: 42 };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await cacheService.get(key);

      expect(result).toEqual(value);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache hit');
    });

    it('should return null on cache miss', async () => {
      const key = 'test:missing';
      mockRedisClient.get.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache miss');
    });

    it('should return null when cached value is undefined', async () => {
      const key = 'test:undefined';
      mockRedisClient.get.mockResolvedValue(undefined as any);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache miss');
    });

    it('should return null when cached value is empty string', async () => {
      const key = 'test:empty';
      mockRedisClient.get.mockResolvedValue('');

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache miss');
    });

    it('should handle complex nested objects', async () => {
      const key = 'test:complex';
      const value = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        nullValue: null,
        boolValue: true,
      };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await cacheService.get(key);

      expect(result).toEqual(value);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it('should handle arrays as cached values', async () => {
      const key = 'test:array';
      const value = [1, 2, 3, 'test', { obj: true }];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await cacheService.get(key);

      expect(result).toEqual(value);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it('should handle primitive values', async () => {
      const key = 'test:string';
      const value = 'simple string';
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await cacheService.get(key);

      expect(result).toEqual(value);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it('should return null and log error when Redis get fails', async () => {
      const key = 'test:error';
      const error = new Error('Redis connection failed');
      mockRedisClient.get.mockRejectedValue(error);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache get failed');
    });

    it('should return null and log error when JSON parsing fails', async () => {
      const key = 'test:invalid-json';
      mockRedisClient.get.mockResolvedValue('invalid json {');

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Redis timeout errors gracefully', async () => {
      const key = 'test:timeout';
      const error = new Error('ETIMEDOUT');
      mockRedisClient.get.mockRejectedValue(error);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache get failed');
    });
  });

  describe('set', () => {
    it('should serialize and store value with default TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test', count: 42 };
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        60
      );
      expect(logger.debug).toHaveBeenCalledWith({ key, ttl: 60 }, 'Cache set');
    });

    it('should serialize and store value with custom TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const ttl = 300;
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value, ttl);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        ttl
      );
      expect(logger.debug).toHaveBeenCalledWith({ key, ttl }, 'Cache set');
    });

    it('should handle storing arrays', async () => {
      const key = 'test:array';
      const value = [1, 2, 3];
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        60
      );
    });

    it('should handle storing primitive values', async () => {
      const key = 'test:string';
      const value = 'simple string';
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        60
      );
    });

    it('should handle storing null values', async () => {
      const key = 'test:null';
      const value = null;
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value as any);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        'null',
        60
      );
    });

    it('should handle storing boolean values', async () => {
      const key = 'test:bool';
      const value = true;
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        'true',
        60
      );
    });

    it('should handle storing numbers', async () => {
      const key = 'test:number';
      const value = 42;
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        '42',
        60
      );
    });

    it('should handle storing zero', async () => {
      const key = 'test:zero';
      const value = 0;
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        '0',
        60
      );
    });

    it('should not throw when Redis set fails', async () => {
      const key = 'test:error';
      const value = { data: 'test' };
      const error = new Error('Redis connection failed');
      mockRedisClient.set.mockRejectedValue(error);

      await expect(cacheService.set(key, value)).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache set failed');
    });

    it('should handle Redis timeout errors gracefully', async () => {
      const key = 'test:timeout';
      const value = { data: 'test' };
      const error = new Error('ETIMEDOUT');
      mockRedisClient.set.mockRejectedValue(error);

      await expect(cacheService.set(key, value)).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache set failed');
    });

    it('should handle complex nested objects', async () => {
      const key = 'test:complex';
      const value = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        nullValue: null,
        boolValue: true,
      };
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        60
      );
    });

    it('should handle TTL of zero', async () => {
      const key = 'test:zero-ttl';
      const value = { data: 'test' };
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value, 0);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        0
      );
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      const key = 'test:key';
      mockRedisClient.del.mockResolvedValue(undefined);

      await cacheService.delete(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache deleted');
    });

    it('should not throw when Redis delete fails', async () => {
      const key = 'test:error';
      const error = new Error('Redis connection failed');
      mockRedisClient.del.mockRejectedValue(error);

      await expect(cacheService.delete(key)).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache delete failed');
    });

    it('should handle deleting non-existent keys gracefully', async () => {
      const key = 'test:nonexistent';
      mockRedisClient.del.mockResolvedValue(undefined);

      await cacheService.delete(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      expect(logger.debug).toHaveBeenCalledWith({ key }, 'Cache deleted');
    });

    it('should handle Redis timeout errors gracefully', async () => {
      const key = 'test:timeout';
      const error = new Error('ETIMEDOUT');
      mockRedisClient.del.mockRejectedValue(error);

      await expect(cacheService.delete(key)).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache delete failed');
    });

    it('should handle network errors gracefully', async () => {
      const key = 'test:network';
      const error = new Error('ECONNREFUSED');
      mockRedisClient.del.mockRejectedValue(error);

      await expect(cacheService.delete(key)).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith({ error, key }, 'Cache delete failed');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid sequential operations', async () => {
      const key = 'test:rapid';
      const value = { data: 'test' };
      mockRedisClient.set.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));
      mockRedisClient.del.mockResolvedValue(undefined);

      await cacheService.set(key, value);
      const result = await cacheService.get(key);
      await cacheService.delete(key);

      expect(result).toEqual(value);
      expect(mockRedisClient.set).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.get).toHaveBeenCalledTimes(1);
      expect(mockRedisClient.del).toHaveBeenCalledTimes(1);
    });

    it('should handle very large TTL values', async () => {
      const key = 'test:large-ttl';
      const value = { data: 'test' };
      const ttl = 86400; // 1 day
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value, ttl);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        ttl
      );
    });

    it('should handle special characters in keys', async () => {
      const key = 'test:key:with:colons:and-dashes_underscores';
      const value = { data: 'test' };
      mockRedisClient.set.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      await cacheService.set(key, value);
      const result = await cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should handle Unicode characters in values', async () => {
      const key = 'test:unicode';
      const value = { text: 'Hello 世界 🌍' };
      mockRedisClient.set.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      await cacheService.set(key, value);
      const result = await cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should handle very long keys', async () => {
      const key = 'test:' + 'a'.repeat(1000);
      const value = { data: 'test' };
      mockRedisClient.set.mockResolvedValue(undefined);

      await cacheService.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        60
      );
    });

    it('should handle Date objects in values', async () => {
      const key = 'test:date';
      const dateValue = new Date('2026-03-27T12:00:00Z');
      const value = { timestamp: dateValue };
      mockRedisClient.set.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      await cacheService.set(key, value);
      const result = await cacheService.get<any>(key);

      // Dates are serialized as ISO strings
      expect(result).toEqual({ timestamp: dateValue.toISOString() });
    });
  });
});
