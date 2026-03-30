import { Knex } from 'knex';
import { AccountEntity, AccountSummary } from '../entities/account.entity';
import { DatabaseError } from '../errors/application.error';
import { createLogger } from '../utils/logger';

const logger = createLogger('AccountRepository');

export interface IAccountRepository {
  getAccountSummaryByDate(asOfDate: Date): Promise<AccountSummary>;
  getAccountsByStatus(status: string, asOfDate: Date): Promise<AccountEntity[]>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private readonly db: Knex) {}

  async getAccountSummaryByDate(asOfDate: Date): Promise<AccountSummary> {
    try {
      logger.info({ asOfDate }, 'Fetching account summary');

      const result = await this.db('accounts')
        .select('status')
        .count('* as count')
        .where('created_at', '<=', asOfDate)
        .groupBy('status');

      const summary: AccountSummary = {
        totalAccounts: 0,
        activeAccounts: 0,
        suspendedAccounts: 0,
        closedAccounts: 0,
      };

      result.forEach((row) => {
        const count = parseInt(String(row.count), 10);
        summary.totalAccounts += count;

        switch (row.status) {
          case 'active':
            summary.activeAccounts = count;
            break;
          case 'suspended':
            summary.suspendedAccounts = count;
            break;
          case 'closed':
            summary.closedAccounts = count;
            break;
        }
      });

      logger.info({ summary }, 'Account summary fetched successfully');
      return summary;
    } catch (error) {
      logger.error({ error, asOfDate }, 'Failed to fetch account summary');
      throw new DatabaseError('Failed to fetch account summary from database');
    }
  }

  async getAccountsByStatus(status: string, asOfDate: Date): Promise<AccountEntity[]> {
    try {
      logger.info({ status, asOfDate }, 'Fetching accounts by status');

      const accounts = await this.db<AccountEntity>('accounts')
        .select('*')
        .where('status', status)
        .where('created_at', '<=', asOfDate)
        .orderBy('created_at', 'desc');

      logger.info({ count: accounts.length, status }, 'Accounts fetched successfully');
      return accounts;
    } catch (error) {
      logger.error({ error, status, asOfDate }, 'Failed to fetch accounts');
      throw new DatabaseError('Failed to fetch accounts from database');
    }
  }
}
