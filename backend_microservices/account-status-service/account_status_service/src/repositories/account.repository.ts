import { Knex } from 'knex';
import { Account } from '../entities/account.entity';
import { AccountStatusHistory } from '../entities/account-status-history.entity';
import { AccountStatus } from '../enums/account-status.enum';

export interface IAccountRepository {
  findById(accountId: string): Promise<Account | null>;
  updateStatus(
    accountId: string,
    newStatus: AccountStatus,
    updatedBy: string,
    expectedVersion: number
  ): Promise<boolean>;
  createStatusHistory(history: Omit<AccountStatusHistory, 'historyId'>): Promise<string>;
  cascadeCardsStatus(accountId: string, newStatus: AccountStatus): Promise<number>;
  getAccountCards(accountId: string): Promise<Array<{ cardNumber: string; status: string }>>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private readonly db: Knex) {}

  async findById(accountId: string): Promise<Account | null> {
    const account = await this.db('accounts')
      .where({ account_id: accountId })
      .first();

    if (!account) {
      return null;
    }

    return {
      accountId: account.account_id,
      accountStatus: account.account_status as AccountStatus,
      balance: parseFloat(account.balance),
      createdAt: new Date(account.created_at),
      updatedAt: new Date(account.updated_at),
      updatedBy: account.updated_by,
      version: account.version,
    };
  }

  async updateStatus(
    accountId: string,
    newStatus: AccountStatus,
    updatedBy: string,
    expectedVersion: number
  ): Promise<boolean> {
    const updatedRows = await this.db('accounts')
      .where({
        account_id: accountId,
        version: expectedVersion,
      })
      .update({
        account_status: newStatus,
        updated_at: this.db.fn.now(),
        updated_by: updatedBy,
        version: expectedVersion + 1,
      });

    return updatedRows > 0;
  }

  async createStatusHistory(
    history: Omit<AccountStatusHistory, 'historyId'>
  ): Promise<string> {
    const [result] = await this.db('account_status_history')
      .insert({
        account_id: history.accountId,
        previous_status: history.previousStatus,
        new_status: history.newStatus,
        reason_code: history.reasonCode,
        notes: history.notes,
        changed_at: history.changedAt,
        changed_by: history.changedBy,
        notify_customer: history.notifyCustomer,
        ip_address: history.ipAddress,
      })
      .returning('history_id');

    return result.history_id;
  }

  async cascadeCardsStatus(accountId: string, newStatus: AccountStatus): Promise<number> {
    const updatedRows = await this.db('cards')
      .where({ account_id: accountId })
      .update({
        card_status: newStatus,
        updated_at: this.db.fn.now(),
      });

    return updatedRows;
  }

  async getAccountCards(accountId: string): Promise<Array<{ cardNumber: string; status: string }>> {
    const cards = await this.db('cards')
      .select('card_number as cardNumber', 'card_status as status')
      .where({ account_id: accountId });

    return cards;
  }

  async beginTransaction(): Promise<Knex.Transaction> {
    return this.db.transaction();
  }
}
