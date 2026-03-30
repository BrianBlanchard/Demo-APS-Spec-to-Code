import { Pool } from 'pg';
import { Customer } from '../types/entities';

export interface CustomerRepository {
  findByCustomerId(customerId: string): Promise<Customer | null>;
}

export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(private readonly pool: Pool) {}

  async findByCustomerId(customerId: string): Promise<Customer | null> {
    const query = `
      SELECT id, customer_id, kyc_status
      FROM customers
      WHERE customer_id = $1
    `;

    const result = await this.pool.query<Customer>(query, [customerId]);
    return result.rows[0] || null;
  }
}
