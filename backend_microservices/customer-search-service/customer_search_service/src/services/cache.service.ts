import { RedisClient, redisClient } from '../repositories/redis.client';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class CacheService implements ICacheService {
  constructor(private redis: RedisClient = redisClient) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        logger.debug({ key }, 'Cache hit');
        return JSON.parse(cached) as T;
      }
      logger.debug({ key }, 'Cache miss');
      return null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get failed');
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = config.redis.ttl): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, ttl);
      logger.debug({ key, ttl }, 'Cache set');
    } catch (error) {
      logger.error({ error, key }, 'Cache set failed');
      // Don't throw - cache failure should not break the main flow
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug({ key }, 'Cache deleted');
    } catch (error) {
      logger.error({ error, key }, 'Cache delete failed');
    }
  }
}
