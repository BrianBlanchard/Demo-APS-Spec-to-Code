import { Knex } from 'knex';
import { Transaction } from '../entities/transaction.entity';

interface TransactionRow {
  transaction_id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: Date;
}

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, 'createdAt'>): Promise<Transaction>;
  findById(transactionId: string): Promise<Transaction | null>;
}

export class TransactionRepository implements ITransactionRepository {
  constructor(private db: Knex) {}

  async create(transaction: Omit<Transaction, 'createdAt'>): Promise<Transaction> {
    const [created] = await this.db<TransactionRow>('transactions')
      .insert({
        transaction_id: transaction.transactionId,
        account_id: transaction.accountId,
        transaction_type: transaction.transactionType,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        created_at: this.db.fn.now(),
      })
      .returning('*');

    return {
      transactionId: created.transaction_id,
      accountId: created.account_id,
      transactionType: created.transaction_type,
      amount: created.amount,
      description: created.description,
      status: created.status,
      createdAt: created.created_at,
    };
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const result = await this.db<TransactionRow>('transactions')
      .where({ transaction_id: transactionId })
      .first();

    if (!result) {
      return null;
    }

    return {
      transactionId: result.transaction_id,
      accountId: result.account_id,
      transactionType: result.transaction_type,
      amount: result.amount,
      description: result.description,
      status: result.status,
      createdAt: result.created_at,
    };
  }
}
