import { Knex } from 'knex';
import { Account, AccountStatus, AccountBalance } from '../models/entities';

export interface IAccountRepository {
  findAccountByAccountId(accountId: string): Promise<Account | null>;
  getAccountBalance(accountId: bigint): Promise<AccountBalance | null>;
  updateAccountBalance(
    accountId: bigint,
    newBalance: string,
    interestAmount: string,
    interestDate: Date,
    currentVersion: bigint,
  ): Promise<void>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private readonly db: Knex) {}

  async findAccountByAccountId(accountId: string): Promise<Account | null> {
    const result = await this.db<Account>('accounts')
      .where({ account_id: accountId })
      .first();

    if (!result) {
      return null;
    }

    return {
      id: BigInt(result.id),
      accountId: result.accountId,
      status: result.status as AccountStatus,
      disclosureGroupId: result.disclosureGroupId ? BigInt(result.disclosureGroupId) : null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getAccountBalance(accountId: bigint): Promise<AccountBalance | null> {
    const result = await this.db<AccountBalance>('account_balances')
      .where({ account_id: accountId.toString() })
      .first();

    if (!result) {
      return null;
    }

    return {
      id: BigInt(result.id),
      accountId: BigInt(result.accountId),
      currentBalance: result.currentBalance,
      purchaseBalance: result.purchaseBalance,
      cashAdvanceBalance: result.cashAdvanceBalance,
      lastInterestAmount: result.lastInterestAmount,
      lastInterestDate: result.lastInterestDate,
      version: BigInt(result.version),
      updatedAt: result.updatedAt,
    };
  }

  async updateAccountBalance(
    accountId: bigint,
    newBalance: string,
    interestAmount: string,
    interestDate: Date,
    currentVersion: bigint,
  ): Promise<void> {
    const updated = await this.db('account_balances')
      .where({
        account_id: accountId.toString(),
        version: currentVersion.toString(),
      })
      .update({
        current_balance: newBalance,
        last_interest_amount: interestAmount,
        last_interest_date: interestDate,
        version: (currentVersion + BigInt(1)).toString(),
        updated_at: this.db.fn.now(),
      });

    if (updated === 0) {
      throw new Error('Optimistic lock failure: Account balance was modified by another transaction');
    }
  }
}
