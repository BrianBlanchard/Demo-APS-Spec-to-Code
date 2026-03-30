import { Database, database } from './database';
import { CustomerProfile, SearchRequest, SearchResult } from '../types/customer.types';
import { logger } from '../utils/logger';
import { normalizePhoneNumber } from '../utils/phone.utils';

export interface ICustomerRepository {
  searchCustomersFallback(request: SearchRequest): Promise<SearchResult[]>;
  getCustomerById(profileId: string): Promise<CustomerProfile | null>;
}

export class CustomerRepository implements ICustomerRepository {
  constructor(private db: Database = database) {}

  async searchCustomersFallback(request: SearchRequest): Promise<SearchResult[]> {
    logger.warn('Using PostgreSQL fallback for customer search');

    const { query, filters, limit = 10, offset = 0 } = request;

    // Normalize phone if query looks like phone number
    const normalizedPhone = query.replace(/\D/g, '').length >= 10
      ? normalizePhoneNumber(query)
      : null;

    let sql = `
      SELECT
        profile_id, first_name, last_name, email, phone,
        loyalty_card, loyalty_tier, last_activity, last_visit_store
      FROM customer_profiles
      WHERE (
        first_name ILIKE $1 OR
        last_name ILIKE $1 OR
        email ILIKE $1 OR
        loyalty_card ILIKE $1 OR
        phone ILIKE $1
        ${normalizedPhone ? 'OR phone = $5' : ''}
      )
    `;

    const params: unknown[] = [`%${query}%`];
    let paramIndex = 2;

    if (filters?.loyalty_tier && filters.loyalty_tier.length > 0) {
      sql += ` AND loyalty_tier = ANY($${paramIndex})`;
      params.push(filters.loyalty_tier);
      paramIndex++;
    }

    if (filters?.store_id) {
      sql += ` AND last_visit_store = $${paramIndex}`;
      params.push(filters.store_id);
      paramIndex++;
    }

    sql += ` ORDER BY last_activity DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    if (normalizedPhone) {
      params.push(normalizedPhone);
    }

    const rows = await this.db.query<CustomerProfile>(sql, params);

    return rows.map((row) => ({
      ...row,
      match_score: 50, // Lower score for fallback results
      highlights: {},
    }));
  }

  async getCustomerById(profileId: string): Promise<CustomerProfile | null> {
    const query = `
      SELECT
        profile_id, first_name, last_name, email, phone,
        loyalty_card, loyalty_tier, last_activity, last_visit_store
      FROM customer_profiles
      WHERE profile_id = $1
    `;

    const rows = await this.db.query<CustomerProfile>(query, [profileId]);
    return rows.length > 0 ? rows[0] : null;
  }
}
