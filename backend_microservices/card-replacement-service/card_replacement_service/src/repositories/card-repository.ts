import { Knex } from 'knex';
import { Card } from '../types/entities';
import { CardStatusType } from '../types/enums';

export interface ICardRepository {
  findByCardNumber(cardNumber: string): Promise<Card | null>;
  create(card: Omit<Card, 'createdAt' | 'updatedAt'>): Promise<Card>;
  updateStatus(cardNumber: string, status: CardStatusType): Promise<void>;
  checkRecentReplacement(cardNumber: string, hoursAgo: number): Promise<string | null>;
}

export class CardRepository implements ICardRepository {
  constructor(private readonly db: Knex) {}

  async findByCardNumber(cardNumber: string): Promise<Card | null> {
    const row = await this.db('cards').where({ card_number: cardNumber }).first();

    if (!row) {
      return null;
    }

    return this.mapRowToCard(row);
  }

  async create(card: Omit<Card, 'createdAt' | 'updatedAt'>): Promise<Card> {
    const [row] = await this.db('cards')
      .insert({
        card_number: card.cardNumber,
        account_id: card.accountId,
        customer_id: card.customerId,
        embossed_name: card.embossedName,
        cvv: card.cvv,
        expiration_date: card.expirationDate,
        issued_date: card.issuedDate,
        status: card.status,
      })
      .returning('*');

    return this.mapRowToCard(row);
  }

  async updateStatus(cardNumber: string, status: CardStatusType): Promise<void> {
    await this.db('cards')
      .where({ card_number: cardNumber })
      .update({
        status,
        updated_at: this.db.fn.now(),
      });
  }

  async checkRecentReplacement(cardNumber: string, hoursAgo: number): Promise<string | null> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

    const row = await this.db('card_replacement_history')
      .where({ original_card_number: cardNumber })
      .where('requested_at', '>=', cutoffTime)
      .orderBy('requested_at', 'desc')
      .first();

    return row ? row.replacement_card_number : null;
  }

  private mapRowToCard(row: Record<string, unknown>): Card {
    return {
      cardNumber: row.card_number as string,
      accountId: row.account_id as string,
      customerId: row.customer_id as string,
      embossedName: row.embossed_name as string,
      cvv: row.cvv as string,
      expirationDate: new Date(row.expiration_date as string),
      issuedDate: new Date(row.issued_date as string),
      status: row.status as CardStatusType,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
