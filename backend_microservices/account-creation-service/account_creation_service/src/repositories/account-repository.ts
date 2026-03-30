import { Pool, PoolClient } from 'pg';
import { Account, AccountBalance } from '../types/entities';
import { AccountStatus, AccountType } from '../types/enums';

export interface CreateAccountData {
  account_id: string;
  customer_id: number;
  status: AccountStatus;
  account_type: AccountType;
  credit_limit: number;
  cash_advance_limit: number;
  opening_date: Date;
  expiration_date: Date;
  reissuance_date: Date | null;
  disclosure_group_id: number;
}

export interface AccountRepository {
  createAccount(data: CreateAccountData, client?: PoolClient): Promise<Account>;
  createAccountBalance(accountId: number, creditLimit: number, client?: PoolClient): Promise<AccountBalance>;
  generateAccountId(): Promise<string>;
}

export class AccountRepositoryImpl implements AccountRepository {
  constructor(private readonly pool: Pool) {}

  async createAccount(data: CreateAccountData, client?: PoolClient): Promise<Account> {
    const db = client || this.pool;
    const query = `
      INSERT INTO accounts (
        account_id, customer_id, status, account_type, credit_limit,
        cash_advance_limit, opening_date, expiration_date, reissuance_date,
        disclosure_group_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      data.account_id,
      data.customer_id,
      data.status,
      data.account_type,
      data.credit_limit,
      data.cash_advance_limit,
      data.opening_date,
      data.expiration_date,
      data.reissuance_date,
      data.disclosure_group_id,
    ];

    const result = await db.query<Account>(query, values);
    return result.rows[0];
  }

  async createAccountBalance(
    accountId: number,
    creditLimit: number,
    client?: PoolClient
  ): Promise<AccountBalance> {
    const db = client || this.pool;
    const availableCredit = creditLimit;

    const query = `
      INSERT INTO account_balances (
        id, account_id, current_balance, available_credit, cash_advance_balance,
        pending_amount, version, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [accountId, accountId, 0.0, availableCredit, 0.0, 0.0, 0];

    const result = await db.query<AccountBalance>(query, values);
    return result.rows[0];
  }

  async generateAccountId(): Promise<string> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const query = `SELECT LPAD(nextval('account_id_seq')::text, 11, '0') as account_id`;
        const result = await this.pool.query<{ account_id: string }>(query);
        return result.rows[0].account_id;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate account ID after maximum retries');
  }
}
