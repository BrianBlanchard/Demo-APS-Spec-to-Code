import { Knex } from 'knex';
import { CardEntity } from '../entities/card.entity';
import { InternalServerException } from '../exceptions/internal-server.exception';
import { logger } from '../infrastructure/logger';

export interface ICardRepository {
  findByCardNumber(cardNumber: string): Promise<CardEntity | null>;
  findByLastFourDigits(lastFour: string, customerId: string): Promise<CardEntity[]>;
}

export class CardRepository implements ICardRepository {
  private readonly tableName = 'cards';

  constructor(private readonly db: Knex) {}

  async findByCardNumber(cardNumber: string): Promise<CardEntity | null> {
    try {
      const card = await this.db<CardEntity>(this.tableName)
        .where({ cardNumber })
        .first();

      return card || null;
    } catch (error) {
      logger.error({ error, cardNumber: '****' }, 'Error finding card by number');
      throw new InternalServerException('Database error while retrieving card');
    }
  }

  async findByLastFourDigits(lastFour: string, customerId: string): Promise<CardEntity[]> {
    try {
      const cards = await this.db<CardEntity>(this.tableName)
        .where('cardNumber', 'like', `%${lastFour}`)
        .andWhere({ customerId });

      return cards;
    } catch (error) {
      logger.error({ error, lastFour, customerId: '****' }, 'Error finding cards by last four');
      throw new InternalServerException('Database error while retrieving cards');
    }
  }
}
