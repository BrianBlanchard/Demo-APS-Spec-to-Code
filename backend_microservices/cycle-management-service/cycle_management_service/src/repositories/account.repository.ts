import { Knex } from 'knex';
import { Account, AccountStatus } from '../types/billing.types';
import { DatabaseError } from '../utils/errors.util';

export interface IAccountRepository {
  findActiveAccounts(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  resetCycleCounters(accountId: string): Promise<void>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private readonly db: Knex) {}

  async findActiveAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.db('accounts')
        .select('*')
        .where('status', AccountStatus.ACTIVE);

      return accounts.map(this.mapToAccount);
    } catch (error) {
      throw new DatabaseError('Failed to fetch active accounts', { error });
    }
  }

  async findById(id: string): Promise<Account | null> {
    try {
      const account = await this.db('accounts').select('*').where('id', id).first();

      return account ? this.mapToAccount(account) : null;
    } catch (error) {
      throw new DatabaseError('Failed to fetch account by ID', { error });
    }
  }

  async resetCycleCounters(accountId: string): Promise<void> {
    try {
      await this.db('accounts')
        .where('id', accountId)
        .update({
          current_cycle_credit: 0.0,
          current_cycle_debit: 0.0,
          updated_at: this.db.fn.now(),
        });
    } catch (error) {
      throw new DatabaseError('Failed to reset cycle counters', { accountId, error });
    }
  }

  private mapToAccount(row: any): Account {
    return {
      id: row.id,
      accountNumber: row.account_number,
      currentCycleCredit: parseFloat(row.current_cycle_credit),
      currentCycleDebit: parseFloat(row.current_cycle_debit),
      status: row.status as AccountStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
