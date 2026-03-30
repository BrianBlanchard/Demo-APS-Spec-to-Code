import { Knex } from 'knex';
import { Card, CardStatus } from '../models/card.model';
import { DatabaseError } from '../errors/custom.errors';
import { logger } from '../config/logger.config';

interface CardDbRow {
  card_number: string;
  account_id: string;
  cvv: string;
  expiration_date: Date;
  status: CardStatus;
  daily_transaction_limit: number;
  daily_transaction_count: number;
  last_transaction_date: Date | null;
  cvv_failure_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICardRepository {
  findByCardNumber(cardNumber: string): Promise<Card | null>;
  updateDailyTransactionCount(cardNumber: string, count: number): Promise<void>;
  incrementCvvFailureCount(cardNumber: string): Promise<number>;
}

export class CardRepository implements ICardRepository {
  constructor(private readonly db: Knex) {}

  async findByCardNumber(cardNumber: string): Promise<Card | null> {
    try {
      const result = await this.db<CardDbRow>('cards')
        .where({ card_number: cardNumber })
        .first()
        .select('*');

      if (!result) {
        return null;
      }

      return {
        cardNumber: result.card_number,
        accountId: result.account_id,
        cvv: result.cvv,
        expirationDate: result.expiration_date,
        status: result.status,
        dailyTransactionLimit: result.daily_transaction_limit,
        dailyTransactionCount: result.daily_transaction_count,
        lastTransactionDate: result.last_transaction_date,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      logger.error({ error, cardNumber: '****' }, 'Failed to fetch card');
      throw new DatabaseError('Failed to fetch card information');
    }
  }

  async updateDailyTransactionCount(cardNumber: string, count: number): Promise<void> {
    try {
      await this.db('cards')
        .where({ card_number: cardNumber })
        .update({
          daily_transaction_count: count,
          last_transaction_date: new Date(),
          updated_at: new Date(),
        });
    } catch (error) {
      logger.error({ error }, 'Failed to update daily transaction count');
      throw new DatabaseError('Failed to update transaction count');
    }
  }

  async incrementCvvFailureCount(cardNumber: string): Promise<number> {
    try {
      const result = await this.db('cards')
        .where({ card_number: cardNumber })
        .increment('cvv_failure_count', 1)
        .returning('cvv_failure_count');

      return (result[0] as { cvv_failure_count: number }).cvv_failure_count;
    } catch (error) {
      logger.error({ error }, 'Failed to increment CVV failure count');
      throw new DatabaseError('Failed to update CVV failure count');
    }
  }
}
