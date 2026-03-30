import { Knex } from 'knex';
import { AccountEntity } from '../entities/account.entity';
import { InternalServerException } from '../exceptions/internal-server.exception';
import { logger } from '../infrastructure/logger';

export interface IAccountRepository {
  findByAccountId(accountId: string): Promise<AccountEntity | null>;
}

export class AccountRepository implements IAccountRepository {
  private readonly tableName = 'accounts';

  constructor(private readonly db: Knex) {}

  async findByAccountId(accountId: string): Promise<AccountEntity | null> {
    try {
      const account = await this.db<AccountEntity>(this.tableName)
        .where({ accountId })
        .first();

      return account || null;
    } catch (error) {
      logger.error({ error, accountId: '****' }, 'Error finding account');
      throw new InternalServerException('Database error while retrieving account');
    }
  }
}
