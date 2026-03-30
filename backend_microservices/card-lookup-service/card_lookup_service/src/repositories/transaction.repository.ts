import { Knex } from 'knex';
import { TransactionEntity } from '../entities/transaction.entity';
import { InternalServerException } from '../exceptions/internal-server.exception';
import { logger } from '../infrastructure/logger';

export interface ITransactionRepository {
  findRecentByCardNumber(cardNumber: string, limit: number): Promise<TransactionEntity[]>;
}

export class TransactionRepository implements ITransactionRepository {
  private readonly tableName = 'transactions';

  constructor(private readonly db: Knex) {}

  async findRecentByCardNumber(cardNumber: string, limit: number = 10): Promise<TransactionEntity[]> {
    try {
      const transactions = await this.db<TransactionEntity>(this.tableName)
        .where({ cardNumber })
        .orderBy('transactionDate', 'desc')
        .limit(limit);

      return transactions;
    } catch (error) {
      logger.error({ error, cardNumber: '****' }, 'Error finding recent transactions');
      throw new InternalServerException('Database error while retrieving transactions');
    }
  }
}
