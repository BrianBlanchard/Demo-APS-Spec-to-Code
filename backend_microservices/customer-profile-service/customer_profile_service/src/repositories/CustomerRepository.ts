import { Knex } from 'knex';
import { CustomerEntity, AccountEntity } from '../types/entities';

export interface ICustomerRepository {
  findById(customerId: string): Promise<CustomerEntity | null>;
  update(customerId: string, updates: Partial<CustomerEntity>, expectedVersion: number): Promise<CustomerEntity>;
  findAccountsByCustomerId(customerId: string): Promise<AccountEntity[]>;
}

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly db: Knex) {}

  async findById(customerId: string): Promise<CustomerEntity | null> {
    const result = await this.db<CustomerEntity>('customers')
      .where({ customer_id: customerId })
      .first();

    return result || null;
  }

  async update(
    customerId: string,
    updates: Partial<CustomerEntity>,
    expectedVersion: number
  ): Promise<CustomerEntity> {
    const [updated] = await this.db<CustomerEntity>('customers')
      .where({ customer_id: customerId, version: expectedVersion })
      .update({
        ...updates,
        version: expectedVersion + 1,
      })
      .returning('*');

    if (!updated) {
      throw new Error('Optimistic lock failure or customer not found');
    }

    return updated;
  }

  async findAccountsByCustomerId(customerId: string): Promise<AccountEntity[]> {
    return this.db<AccountEntity>('accounts')
      .where({ customer_id: customerId })
      .select('*');
  }
}
