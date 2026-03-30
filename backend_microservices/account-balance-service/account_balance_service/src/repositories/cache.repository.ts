import { RedisClient } from '../config/redis';
import { AccountBalance } from '../types/account.types';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ICacheRepository {
  getBalance(accountId: string): Promise<AccountBalance | null>;
  setBalance(accountId: string, balance: AccountBalance): Promise<void>;
  invalidateBalance(accountId: string): Promise<void>;
}

export class CacheRepository implements ICacheRepository {
  constructor(private readonly redis: RedisClient) {}

  async getBalance(accountId: string): Promise<AccountBalance | null> {
    try {
      const cached = await this.redis.get(`balance:${accountId}`);
      if (cached) {
        return JSON.parse(cached) as AccountBalance;
      }
      return null;
    } catch (error) {
      logger.warn({ error, accountId }, 'Cache get failed, continuing without cache');
      return null;
    }
  }

  async setBalance(accountId: string, balance: AccountBalance): Promise<void> {
    try {
      await this.redis.setEx(`balance:${accountId}`, config.redis.ttl, JSON.stringify(balance));
    } catch (error) {
      logger.warn({ error, accountId }, 'Cache set failed, continuing without cache');
    }
  }

  async invalidateBalance(accountId: string): Promise<void> {
    try {
      await this.redis.del(`balance:${accountId}`);
    } catch (error) {
      logger.warn({ error, accountId }, 'Cache invalidation failed');
    }
  }
}
