import { Knex } from 'knex';
import { CustomerEntity } from '../entities/customer.entity';
import { InternalServerException } from '../exceptions/internal-server.exception';
import { logger } from '../infrastructure/logger';

export interface ICustomerRepository {
  findByCustomerId(customerId: string): Promise<CustomerEntity | null>;
}

export class CustomerRepository implements ICustomerRepository {
  private readonly tableName = 'customers';

  constructor(private readonly db: Knex) {}

  async findByCustomerId(customerId: string): Promise<CustomerEntity | null> {
    try {
      const customer = await this.db<CustomerEntity>(this.tableName)
        .where({ customerId })
        .first();

      return customer || null;
    } catch (error) {
      logger.error({ error, customerId: '****' }, 'Error finding customer');
      throw new InternalServerException('Database error while retrieving customer');
    }
  }
}
