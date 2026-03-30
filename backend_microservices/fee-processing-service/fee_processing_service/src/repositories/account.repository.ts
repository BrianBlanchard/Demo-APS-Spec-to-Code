import { Knex } from 'knex';
import { Account } from '../entities/account.entity';

interface AccountRow {
  account_id: string;
  balance: number;
  credit_limit: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAccountRepository {
  findById(accountId: string): Promise<Account | null>;
  updateBalance(accountId: string, newBalance: number): Promise<void>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private db: Knex) {}

  async findById(accountId: string): Promise<Account | null> {
    const result = await this.db<AccountRow>('accounts')
      .where({ account_id: accountId })
      .first();

    if (!result) {
      return null;
    }

    return {
      accountId: result.account_id,
      balance: result.balance,
      creditLimit: result.credit_limit,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    await this.db('accounts')
      .where({ account_id: accountId })
      .update({
        balance: newBalance,
        updated_at: this.db.fn.now(),
      });
  }
}
