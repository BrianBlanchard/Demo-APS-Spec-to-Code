import { Knex } from 'knex';
import { DatabaseError } from '../utils/errors';

export interface Card {
  cardNumber: string;
  accountId: string;
  status: CardStatus;
}

export enum CardStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export interface CardRepository {
  findByCardNumber(cardNumber: string, trx?: Knex.Transaction): Promise<Card | null>;
}

export class CardRepositoryImpl implements CardRepository {
  constructor(private db: Knex) {}

  async findByCardNumber(cardNumber: string, trx?: Knex.Transaction): Promise<Card | null> {
    try {
      const row = await (trx || this.db)('cards')
        .where('card_number', cardNumber)
        .first();

      if (!row) {
        return null;
      }

      return {
        cardNumber: row.card_number,
        accountId: row.account_id,
        status: row.status as CardStatus,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find card: ${(error as Error).message}`);
    }
  }
}
