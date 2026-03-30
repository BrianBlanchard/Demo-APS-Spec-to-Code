import { IAuditRepository, AuditRepository } from '../repositories/audit.repository';
import { SearchAuditLog } from '../types/customer.types';
import { logger } from '../utils/logger';
import { maskSensitiveData } from '../utils/query.utils';

export interface IAuditService {
  logSearch(
    userId: string,
    query: string,
    filters: Record<string, unknown> | undefined,
    resultCount: number,
    queryTimeMs: number
  ): Promise<void>;
}

export class AuditService implements IAuditService {
  constructor(private auditRepository: IAuditRepository = new AuditRepository()) {}

  async logSearch(
    userId: string,
    query: string,
    filters: Record<string, unknown> | undefined,
    resultCount: number,
    queryTimeMs: number
  ): Promise<void> {
    try {
      const logEntry: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: userId,
        query,
        filters,
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: resultCount === 0,
      };

      await this.auditRepository.logSearch(logEntry);

      logger.info(
        {
          userId: maskSensitiveData(userId),
          query: maskSensitiveData(query),
          resultCount,
          queryTimeMs,
          zeroResults: resultCount === 0,
        },
        'Search audit logged'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to log search audit');
      // Don't throw - audit logging failure should not break the main flow
    }
  }
}
