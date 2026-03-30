import { Database } from '../database/db';
import { AccountStatus } from '../types/account-status.enum';

export interface AccountEntity {
  id: number;
  account_id: string;
  status: AccountStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IAccountRepository {
  findByAccountId(accountId: string): Promise<AccountEntity | null>;
}

export class AccountRepository implements IAccountRepository {
  constructor(private db: Database) {}

  async findByAccountId(accountId: string): Promise<AccountEntity | null> {
    const query = `
      SELECT id, account_id, status, created_at, updated_at
      FROM accounts
      WHERE account_id = $1
    `;

    const result = await this.db.query<AccountEntity>(query, [accountId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
