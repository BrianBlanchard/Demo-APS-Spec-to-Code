import { database, Database } from './database';
import { SearchAuditLog } from '../types/customer.types';
import { randomUUID } from 'crypto';

export interface IAuditRepository {
  logSearch(log: Omit<SearchAuditLog, 'search_id' | 'created_at'>): Promise<void>;
}

export class AuditRepository implements IAuditRepository {
  constructor(private db: Database = database) {}

  async logSearch(log: Omit<SearchAuditLog, 'search_id' | 'created_at'>): Promise<void> {
    const query = `
      INSERT INTO search_audit_logs (
        search_id, user_id, query, filters, result_count, query_time_ms, zero_results, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;

    const searchId = randomUUID();
    const zeroResults = log.result_count === 0;

    await this.db.query(query, [
      searchId,
      log.user_id,
      log.query,
      JSON.stringify(log.filters || {}),
      log.result_count,
      log.query_time_ms,
      zeroResults,
    ]);
  }
}
