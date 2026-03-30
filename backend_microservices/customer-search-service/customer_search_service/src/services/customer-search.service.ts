import { ISearchRepository, SearchRepository } from '../repositories/search.repository';
import { ICustomerRepository, CustomerRepository } from '../repositories/customer.repository';
import { ICacheService, CacheService } from './cache.service';
import { IAuditService, AuditService } from './audit.service';
import { SearchRequest, SearchResponse } from '../types/customer.types';
import { ServiceUnavailableError } from '../types/error.types';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';

export interface ICustomerSearchService {
  searchCustomers(request: SearchRequest, userId: string): Promise<SearchResponse>;
}

export class CustomerSearchService implements ICustomerSearchService {
  constructor(
    private searchRepository: ISearchRepository = new SearchRepository(),
    private customerRepository: ICustomerRepository = new CustomerRepository(),
    private cacheService: ICacheService = new CacheService(),
    private auditService: IAuditService = new AuditService()
  ) {}

  async searchCustomers(request: SearchRequest, userId: string): Promise<SearchResponse> {
    const startTime = Date.now();

    // Generate cache key
    const cacheKey = this.generateCacheKey(request);

    // Check cache
    const cached = await this.cacheService.get<SearchResponse>(cacheKey);
    if (cached) {
      const queryTimeMs = Date.now() - startTime;
      logger.info({ cacheKey, queryTimeMs }, 'Returning cached search results');

      // Still log audit for cached results
      await this.auditService.logSearch(
        userId,
        request.query,
        request.filters as Record<string, unknown>,
        cached.total_results,
        queryTimeMs
      );

      return cached;
    }

    // Check if Elasticsearch is available
    const esAvailable = await this.searchRepository.isAvailable();

    let results;
    try {
      if (esAvailable) {
        results = await this.searchRepository.searchCustomers(request);
      } else {
        logger.warn('Elasticsearch unavailable, using PostgreSQL fallback');
        results = await this.customerRepository.searchCustomersFallback(request);
      }
    } catch (error) {
      logger.error({ error }, 'Search failed, attempting fallback');

      // Try fallback if primary search fails
      try {
        results = await this.customerRepository.searchCustomersFallback(request);
      } catch (fallbackError) {
        logger.error({ error: fallbackError }, 'Fallback search also failed');
        throw new ServiceUnavailableError('Search service temporarily unavailable');
      }
    }

    const queryTimeMs = Date.now() - startTime;

    const response: SearchResponse = {
      total_results: results.length,
      results,
      query_time_ms: queryTimeMs,
      pagination: {
        limit: request.limit || 10,
        offset: request.offset || 0,
        has_more: results.length === (request.limit || 10),
      },
    };

    // Cache the results
    await this.cacheService.set(cacheKey, response);

    // Log audit
    await this.auditService.logSearch(
      userId,
      request.query,
      request.filters as Record<string, unknown>,
      response.total_results,
      queryTimeMs
    );

    return response;
  }

  private generateCacheKey(request: SearchRequest): string {
    const key = JSON.stringify({
      q: request.query,
      f: request.search_fields,
      ft: request.filters,
      l: request.limit,
      o: request.offset,
    });

    return `search:${createHash('md5').update(key).digest('hex')}`;
  }
}
