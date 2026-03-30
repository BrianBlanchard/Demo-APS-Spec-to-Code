import { Knex } from 'knex';
import { Transaction, TransactionStatus } from '../models/transaction.model';
import { DatabaseError, TransactionIdGenerationError } from '../utils/errors';

export interface TransactionRepository {
  generateTransactionId(trx: Knex.Transaction): Promise<string>;
  findByValidationId(validationId: string, trx?: Knex.Transaction): Promise<Transaction | null>;
  create(transaction: Omit<Transaction, 'postedTimestamp'>, trx: Knex.Transaction): Promise<Transaction>;
  findById(transactionId: string, trx?: Knex.Transaction): Promise<Transaction | null>;
}

export class TransactionRepositoryImpl implements TransactionRepository {
  constructor(private db: Knex) {}

  async generateTransactionId(trx: Knex.Transaction): Promise<string> {
    try {
      const result = await trx('transactions')
        .max('transaction_id as maxId')
        .forUpdate()
        .first();

      const maxId = result?.maxId || '0000000000000000';
      const nextId = (BigInt(maxId) + BigInt(1)).toString().padStart(16, '0');

      // Verify uniqueness
      const exists = await trx('transactions')
        .where('transaction_id', nextId)
        .first();

      if (exists) {
        throw new TransactionIdGenerationError();
      }

      return nextId;
    } catch (error) {
      if (error instanceof TransactionIdGenerationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to generate transaction ID: ${(error as Error).message}`);
    }
  }

  async findByValidationId(
    validationId: string,
    trx?: Knex.Transaction,
  ): Promise<Transaction | null> {
    try {
      const query = (trx || this.db)('transactions')
        .where('validation_id', validationId)
        .first();

      const row = await query;

      if (!row) {
        return null;
      }

      return this.mapRowToTransaction(row);
    } catch (error) {
      throw new DatabaseError(`Failed to find transaction by validation ID: ${(error as Error).message}`);
    }
  }

  async create(
    transaction: Omit<Transaction, 'postedTimestamp'>,
    trx: Knex.Transaction,
  ): Promise<Transaction> {
    try {
      const now = new Date();

      const [row] = await trx('transactions')
        .insert({
          transaction_id: transaction.transactionId,
          card_number: transaction.cardNumber,
          account_id: transaction.accountId,
          transaction_type: transaction.transactionType,
          transaction_category: transaction.transactionCategory,
          transaction_amount: transaction.transactionAmount,
          merchant_id: transaction.merchantId,
          merchant_name: transaction.merchantName,
          merchant_city: transaction.merchantCity,
          merchant_zip: transaction.merchantZip,
          transaction_source: transaction.transactionSource,
          transaction_description: transaction.transactionDescription,
          original_timestamp: transaction.originalTimestamp,
          posted_timestamp: now,
          authorization_code: transaction.authorizationCode,
          validation_id: transaction.validationId,
          status: transaction.status,
        })
        .returning('*');

      return this.mapRowToTransaction(row);
    } catch (error) {
      throw new DatabaseError(`Failed to create transaction: ${(error as Error).message}`);
    }
  }

  async findById(transactionId: string, trx?: Knex.Transaction): Promise<Transaction | null> {
    try {
      const query = (trx || this.db)('transactions')
        .where('transaction_id', transactionId)
        .first();

      const row = await query;

      if (!row) {
        return null;
      }

      return this.mapRowToTransaction(row);
    } catch (error) {
      throw new DatabaseError(`Failed to find transaction by ID: ${(error as Error).message}`);
    }
  }

  private mapRowToTransaction(row: any): Transaction {
    return {
      transactionId: row.transaction_id,
      cardNumber: row.card_number,
      accountId: row.account_id,
      transactionType: row.transaction_type,
      transactionCategory: row.transaction_category,
      transactionAmount: parseFloat(row.transaction_amount),
      merchantId: row.merchant_id,
      merchantName: row.merchant_name,
      merchantCity: row.merchant_city,
      merchantZip: row.merchant_zip,
      transactionSource: row.transaction_source,
      transactionDescription: row.transaction_description,
      originalTimestamp: new Date(row.original_timestamp),
      postedTimestamp: new Date(row.posted_timestamp),
      authorizationCode: row.authorization_code,
      validationId: row.validation_id,
      status: row.status as TransactionStatus,
    };
  }
}
