import { RedisClientType } from 'redis';
import { logger } from '../infrastructure/logger';
import { config } from '../infrastructure/config';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class CacheService implements ICacheService {
  constructor(private readonly redis: RedisClientType) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn({ error, key }, 'Cache get error');
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = config.redis.ttl): Promise<void> {
    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.warn({ error, key }, 'Cache set error');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.warn({ error, key }, 'Cache delete error');
    }
  }
}
