import { Knex } from 'knex';
import { Validation, ValidationStatus } from '../models/transaction.model';
import { DatabaseError } from '../utils/errors';

export interface ValidationRepository {
  findById(validationId: string, trx?: Knex.Transaction): Promise<Validation | null>;
}

export class ValidationRepositoryImpl implements ValidationRepository {
  constructor(private db: Knex) {}

  async findById(validationId: string, trx?: Knex.Transaction): Promise<Validation | null> {
    try {
      const row = await (trx || this.db)('validations')
        .where('validation_id', validationId)
        .first();

      if (!row) {
        return null;
      }

      return {
        validationId: row.validation_id,
        authorizationCode: row.authorization_code,
        cardNumber: row.card_number,
        amount: parseFloat(row.amount),
        status: row.status as ValidationStatus,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find validation: ${(error as Error).message}`);
    }
  }
}
