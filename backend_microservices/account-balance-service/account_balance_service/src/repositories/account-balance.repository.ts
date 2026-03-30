import { Knex } from 'knex';
import { AccountBalanceEntity, BalanceHistoryEntity } from '../types/account.types';
import { NotFoundError } from '../types/error.types';
import { randomUUID } from 'crypto';

export interface IAccountBalanceRepository {
  findByAccountId(accountId: string): Promise<AccountBalanceEntity | null>;
  updateBalance(
    accountId: string,
    amount: number,
    isDebit: boolean,
    transactionId: string,
    transactionType: string
  ): Promise<{ previous: number; current: number }>;
  recordBalanceHistory(history: Omit<BalanceHistoryEntity, 'history_id'>): Promise<void>;
}

export class AccountBalanceRepository implements IAccountBalanceRepository {
  constructor(private readonly db: Knex) {}

  async findByAccountId(accountId: string): Promise<AccountBalanceEntity | null> {
    const result = await this.db<AccountBalanceEntity>('account_balances')
      .where('account_id', accountId)
      .first();

    return result || null;
  }

  async updateBalance(
    accountId: string,
    amount: number,
    isDebit: boolean,
    transactionId: string,
    transactionType: string
  ): Promise<{ previous: number; current: number }> {
    return await this.db.transaction(async (trx) => {
      const account = await trx<AccountBalanceEntity>('account_balances')
        .where('account_id', accountId)
        .forUpdate()
        .timeout(5000)
        .first();

      if (!account) {
        throw new NotFoundError(`Account ${accountId} not found`);
      }

      const previousBalance = account.current_balance;
      const balanceChange = isDebit ? amount : -amount;
      const newBalance = previousBalance + balanceChange;

      const cycleField = isDebit ? 'current_cycle_debit' : 'current_cycle_credit';
      const cycleUpdate = isDebit
        ? account.current_cycle_debit + amount
        : account.current_cycle_credit + amount;

      await trx<AccountBalanceEntity>('account_balances')
        .where('account_id', accountId)
        .update({
          current_balance: newBalance,
          [cycleField]: cycleUpdate,
          last_transaction_date: trx.fn.now(),
          updated_at: trx.fn.now(),
          version: account.version + 1,
        });

      await this.recordBalanceHistory(
        {
          account_id: accountId,
          transaction_id: transactionId,
          previous_balance: previousBalance,
          new_balance: newBalance,
          amount,
          transaction_type: transactionType,
          recorded_at: new Date(),
        },
        trx
      );

      return { previous: previousBalance, current: newBalance };
    });
  }

  async recordBalanceHistory(
    history: Omit<BalanceHistoryEntity, 'history_id'>,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx || this.db;
    await query<BalanceHistoryEntity>('balance_history').insert({
      history_id: randomUUID(),
      ...history,
    });
  }
}
