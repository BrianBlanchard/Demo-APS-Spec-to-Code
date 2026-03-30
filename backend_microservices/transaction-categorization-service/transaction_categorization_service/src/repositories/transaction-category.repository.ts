import { Knex } from 'knex';
import type { TransactionCategory } from '../entities/transaction-category.entity';
import { DatabaseError } from '../middleware/error-handler.middleware';
import logger from '../utils/logger';

export interface ITransactionCategoryRepository {
  findByMcc(mcc: string): Promise<TransactionCategory | null>;
  checkDatabaseHealth(): Promise<boolean>;
}

export class TransactionCategoryRepository implements ITransactionCategoryRepository {
  constructor(private readonly db: Knex) {}

  async findByMcc(mcc: string): Promise<TransactionCategory | null> {
    try {
      logger.debug({ mcc }, 'Querying transaction category by MCC');

      const result = await this.db<TransactionCategory>('transaction_categories')
        .select(
          'category_code as categoryCode',
          'category_name as categoryName',
          'transaction_type as transactionType',
          'category_group as categoryGroup',
          'interest_rate as interestRate',
          'rewards_eligible as rewardsEligible',
          'rewards_rate as rewardsRate'
        )
        .where('category_code', mcc)
        .first();

      if (!result) {
        logger.debug({ mcc }, 'No category found for MCC');
        return null;
      }

      logger.debug({ mcc, category: result.categoryName }, 'Category found');
      return result;
    } catch (error) {
      logger.error({ error, mcc }, 'Database error querying category');
      throw new DatabaseError('Failed to query transaction category');
    }
  }

  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.db.raw('SELECT 1');
      return true;
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      return false;
    }
  }
}
