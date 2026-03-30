import { Database } from '../database/db';
import { CardEntity } from '../entities/card.entity';

export interface ICardRepository {
  create(card: Omit<CardEntity, 'id' | 'created_at' | 'updated_at'>): Promise<CardEntity>;
  findById(id: number): Promise<CardEntity | null>;
  findByEncryptedCardNumber(encryptedCardNumber: string): Promise<CardEntity | null>;
  findByLastFourDigits(lastFour: string): Promise<CardEntity[]>;
  findByAccountId(accountId: string): Promise<CardEntity[]>;
}

export class CardRepository implements ICardRepository {
  constructor(private db: Database) {}

  async create(card: Omit<CardEntity, 'id' | 'created_at' | 'updated_at'>): Promise<CardEntity> {
    const query = `
      INSERT INTO cards (
        card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING
        id, card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
    `;

    const values = [
      card.card_number,
      card.last_four_digits,
      card.account_id,
      card.status,
      card.expiration_date,
      card.embossed_name || null,
    ];

    const result = await this.db.query<CardEntity>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to create card');
    }

    return result.rows[0];
  }

  async findById(id: number): Promise<CardEntity | null> {
    const query = `
      SELECT
        id, card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
      FROM cards
      WHERE id = $1
    `;

    const result = await this.db.query<CardEntity>(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByEncryptedCardNumber(encryptedCardNumber: string): Promise<CardEntity | null> {
    const query = `
      SELECT
        id, card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
      FROM cards
      WHERE card_number = $1
    `;

    const result = await this.db.query<CardEntity>(query, [encryptedCardNumber]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByLastFourDigits(lastFour: string): Promise<CardEntity[]> {
    const query = `
      SELECT
        id, card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
      FROM cards
      WHERE last_four_digits = $1
      ORDER BY created_at DESC
    `;

    const result = await this.db.query<CardEntity>(query, [lastFour]);
    return result.rows;
  }

  async findByAccountId(accountId: string): Promise<CardEntity[]> {
    const query = `
      SELECT
        id, card_number, last_four_digits, account_id, status,
        expiration_date, embossed_name, created_at, updated_at
      FROM cards
      WHERE account_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.db.query<CardEntity>(query, [accountId]);
    return result.rows;
  }
}
