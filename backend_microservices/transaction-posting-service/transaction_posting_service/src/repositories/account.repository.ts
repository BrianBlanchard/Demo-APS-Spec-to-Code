import { Knex } from 'knex';
import { Account, AccountStatus, BalanceUpdate } from '../models/transaction.model';
import { DatabaseError } from '../utils/errors';

export interface AccountRepository {
  findByCardNumber(cardNumber: string, trx: Knex.Transaction): Promise<Account | null>;
  updateBalance(update: BalanceUpdate, trx: Knex.Transaction): Promise<Account>;
}

export class AccountRepositoryImpl implements AccountRepository {
  constructor(_db: Knex) {
    // DB connection is managed by the transaction passed to each method
  }

  async findByCardNumber(cardNumber: string, trx: Knex.Transaction): Promise<Account | null> {
    try {
      const row = await trx('accounts')
        .join('cards', 'accounts.account_id', 'cards.account_id')
        .where('cards.card_number', cardNumber)
        .select('accounts.*')
        .forUpdate()
        .first();

      if (!row) {
        return null;
      }

      return this.mapRowToAccount(row);
    } catch (error) {
      throw new DatabaseError(`Failed to find account by card number: ${(error as Error).message}`);
    }
  }

  async updateBalance(update: BalanceUpdate, trx: Knex.Transaction): Promise<Account> {
    try {
      const isDebit = ['01', '03', '04', '05'].includes(update.transactionType);
      const isCredit = update.transactionType === '02';

      const updateData: any = {
        current_balance: update.newBalance,
        last_transaction_date: new Date(),
      };

      if (isDebit) {
        updateData.current_cycle_debit = trx.raw('current_cycle_debit + ?', [Math.abs(update.transactionAmount)]);
      } else if (isCredit) {
        updateData.current_cycle_credit = trx.raw('current_cycle_credit + ?', [Math.abs(update.transactionAmount)]);
      }

      const [row] = await trx('accounts')
        .where('account_id', update.accountId)
        .update(updateData)
        .returning('*');

      return this.mapRowToAccount(row);
    } catch (error) {
      throw new DatabaseError(`Failed to update account balance: ${(error as Error).message}`);
    }
  }

  private mapRowToAccount(row: any): Account {
    return {
      accountId: row.account_id,
      cardNumber: row.card_number || '',
      currentBalance: parseFloat(row.current_balance),
      availableCredit: parseFloat(row.available_credit),
      creditLimit: parseFloat(row.credit_limit),
      currentCycleDebit: parseFloat(row.current_cycle_debit),
      currentCycleCredit: parseFloat(row.current_cycle_credit),
      lastTransactionDate: row.last_transaction_date ? new Date(row.last_transaction_date) : null,
      status: row.status as AccountStatus,
    };
  }
}
