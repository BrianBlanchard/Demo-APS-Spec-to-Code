import { Knex } from 'knex';
import { AccountStatus, AccountWithCredit } from '../models/account.model';
import { DatabaseError } from '../errors/custom.errors';
import { logger } from '../config/logger.config';

interface AccountDbRow {
  account_id: string;
  credit_limit: number;
  current_balance: number;
  available_cash_credit: number;
  status: AccountStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IAccountRepository {
  findByAccountId(accountId: string): Promise<AccountWithCredit | null>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private readonly db: Knex) {}

  async findByAccountId(accountId: string): Promise<AccountWithCredit | null> {
    try {
      const result = await this.db<AccountDbRow>('accounts')
        .where({ account_id: accountId })
        .first()
        .select('*');

      if (!result) {
        return null;
      }

      const creditLimit = result.credit_limit;
      const currentBalance = result.current_balance;
      const availableCredit = creditLimit - currentBalance;

      return {
        accountId: result.account_id,
        creditLimit,
        currentBalance,
        availableCashCredit: result.available_cash_credit,
        status: result.status,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        availableCredit,
      };
    } catch (error) {
      logger.error({ error, accountId }, 'Failed to fetch account');
      throw new DatabaseError('Failed to fetch account information');
    }
  }
}
