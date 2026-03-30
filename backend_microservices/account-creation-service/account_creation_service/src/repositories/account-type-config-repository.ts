import { Pool } from 'pg';
import { AccountTypeConfig } from '../types/entities';
import { AccountType } from '../types/enums';

export interface AccountTypeConfigRepository {
  findByAccountType(accountType: AccountType): Promise<AccountTypeConfig | null>;
}

export class AccountTypeConfigRepositoryImpl implements AccountTypeConfigRepository {
  constructor(private readonly pool: Pool) {}

  async findByAccountType(accountType: AccountType): Promise<AccountTypeConfig | null> {
    const query = `
      SELECT account_type, term_months
      FROM account_type_configs
      WHERE account_type = $1
    `;

    const result = await this.pool.query<AccountTypeConfig>(query, [accountType]);
    return result.rows[0] || null;
  }
}
