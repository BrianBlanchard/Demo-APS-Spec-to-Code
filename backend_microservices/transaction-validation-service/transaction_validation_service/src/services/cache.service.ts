import { createClient } from 'redis';
import { Card } from '../models/card.model';
import { AccountWithCredit } from '../models/account.model';
import { logger } from '../config/logger.config';
import { envConfig } from '../config/env.config';

export interface ICacheService {
  getCard(cardNumber: string): Promise<Card | null>;
  setCard(cardNumber: string, card: Card): Promise<void>;
  getAccount(accountId: string): Promise<AccountWithCredit | null>;
  setAccount(accountId: string, account: AccountWithCredit): Promise<void>;
}

export class CacheService implements ICacheService {
  constructor(private readonly redis: ReturnType<typeof createClient>) {}

  async getCard(cardNumber: string): Promise<Card | null> {
    try {
      const cached = await this.redis.get(`card:${cardNumber}`);
      if (cached) {
        logger.debug({ cardNumber: '****' }, 'Card found in cache');
        return JSON.parse(cached) as Card;
      }
      return null;
    } catch (error) {
      logger.warn({ error }, 'Failed to get card from cache');
      return null;
    }
  }

  async setCard(cardNumber: string, card: Card): Promise<void> {
    try {
      await this.redis.setEx(
        `card:${cardNumber}`,
        envConfig.redis.ttl,
        JSON.stringify(card)
      );
      logger.debug({ cardNumber: '****' }, 'Card cached');
    } catch (error) {
      logger.warn({ error }, 'Failed to cache card');
    }
  }

  async getAccount(accountId: string): Promise<AccountWithCredit | null> {
    try {
      const cached = await this.redis.get(`account:${accountId}`);
      if (cached) {
        logger.debug({ accountId }, 'Account found in cache');
        return JSON.parse(cached) as AccountWithCredit;
      }
      return null;
    } catch (error) {
      logger.warn({ error }, 'Failed to get account from cache');
      return null;
    }
  }

  async setAccount(accountId: string, account: AccountWithCredit): Promise<void> {
    try {
      await this.redis.setEx(
        `account:${accountId}`,
        envConfig.redis.ttl,
        JSON.stringify(account)
      );
      logger.debug({ accountId }, 'Account cached');
    } catch (error) {
      logger.warn({ error }, 'Failed to cache account');
    }
  }
}
