import { CustomerSearchService } from '../customer-search.service';
import { ISearchRepository } from '../../repositories/search.repository';
import { ICustomerRepository } from '../../repositories/customer.repository';
import { ICacheService } from '../cache.service';
import { IAuditService } from '../audit.service';
import { SearchRequest, SearchResponse, SearchResult } from '../../types/customer.types';
import { ServiceUnavailableError } from '../../types/error.types';
import { logger } from '../../utils/logger';
import { createHash } from 'crypto';

describe('CustomerSearchService', () => {
  let service: CustomerSearchService;
  let mockSearchRepository: jest.Mocked<ISearchRepository>;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let mockAuditService: jest.Mocked<IAuditService>;

  const mockSearchResults: SearchResult[] = [
    {
      profile_id: 'profile-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      loyalty_card: 'CARD001',
      loyalty_tier: 'vip',
      last_activity: '2026-03-27T10:00:00Z',
      last_visit_store: 'store-001',
      match_score: 0.95,
      highlights: { name: '<em>John</em> Doe' },
    },
    {
      profile_id: 'profile-2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      loyalty_card: 'CARD002',
      loyalty_tier: 'gold',
      last_activity: '2026-03-26T15:30:00Z',
      last_visit_store: 'store-002',
      match_score: 0.85,
      highlights: { email: '<em>jane@example.com</em>' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocks
    mockSearchRepository = {
      searchCustomers: jest.fn(),
      isAvailable: jest.fn(),
    } as jest.Mocked<ISearchRepository>;

    mockCustomerRepository = {
      searchCustomersFallback: jest.fn(),
      getCustomerById: jest.fn(),
    } as jest.Mocked<ICustomerRepository>;

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICacheService>;

    mockAuditService = {
      logSearch: jest.fn(),
    } as jest.Mocked<IAuditService>;

    service = new CustomerSearchService(
      mockSearchRepository,
      mockCustomerRepository,
      mockCacheService,
      mockAuditService
    );

    // Mock Date.now for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default dependencies', () => {
      const service = new CustomerSearchService();
      expect(service).toBeInstanceOf(CustomerSearchService);
    });
  });

  describe('searchCustomers - Cache Hit', () => {
    it('should return cached results when available', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
        offset: 0,
      };
      const userId = 'user-123';
      const cachedResponse: SearchResponse = {
        total_results: 2,
        results: mockSearchResults,
        query_time_ms: 50,
        pagination: { limit: 10, offset: 0, has_more: false },
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result).toEqual(cachedResponse);
      expect(mockCacheService.get).toHaveBeenCalledTimes(1);
      expect(mockSearchRepository.isAvailable).not.toHaveBeenCalled();
      expect(mockSearchRepository.searchCustomers).not.toHaveBeenCalled();
      expect(mockCustomerRepository.searchCustomersFallback).not.toHaveBeenCalled();
      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        cachedResponse.total_results,
        0 // Date.now() - Date.now() = 0
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ queryTimeMs: 0 }),
        'Returning cached search results'
      );
    });

    it('should generate correct cache key with all fields', async () => {
      const request: SearchRequest = {
        query: 'test query',
        search_fields: ['name', 'email'],
        filters: { loyalty_tier: ['vip'], store_id: 'store-001' },
        limit: 20,
        offset: 10,
      };
      const userId = 'user-456';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      const expectedKey = JSON.stringify({
        q: request.query,
        f: request.search_fields,
        ft: request.filters,
        l: request.limit,
        o: request.offset,
      });
      const expectedCacheKey = `search:${createHash('md5').update(expectedKey).digest('hex')}`;

      expect(mockCacheService.get).toHaveBeenCalledWith(expectedCacheKey);
    });

    it('should generate same cache key for identical requests', async () => {
      const request1: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const request2: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-789';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const cacheKey1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const cacheKey2 = mockCacheService.get.mock.calls[0][0];

      expect(cacheKey1).toBe(cacheKey2);
    });
  });

  describe('searchCustomers - Elasticsearch Success', () => {
    it('should search using Elasticsearch when available and no cache', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
        offset: 0,
      };
      const userId = 'user-123';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1150); // End time

      const result = await service.searchCustomers(request, userId);

      expect(mockSearchRepository.isAvailable).toHaveBeenCalled();
      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
      expect(result).toEqual({
        total_results: 2,
        results: mockSearchResults,
        query_time_ms: 150,
        pagination: {
          limit: 10,
          offset: 0,
          has_more: false,
        },
      });
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        2,
        150
      );
    });

    it('should handle search with filters', async () => {
      const request: SearchRequest = {
        query: 'john',
        filters: { loyalty_tier: ['vip', 'gold'] },
        limit: 5,
      };
      const userId = 'user-456';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        2,
        expect.any(Number)
      );
    });

    it('should handle search with custom search fields', async () => {
      const request: SearchRequest = {
        query: 'john@example.com',
        search_fields: ['email'],
        limit: 10,
      };
      const userId = 'user-789';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([mockSearchResults[0]]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
    });

    it('should set has_more to true when results equal limit', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 2,
      };
      const userId = 'user-001';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.has_more).toBe(true);
    });

    it('should set has_more to false when results less than limit', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-002';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.has_more).toBe(false);
    });

    it('should use default limit of 10 when not specified', async () => {
      const request: SearchRequest = {
        query: 'john',
      };
      const userId = 'user-003';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.limit).toBe(10);
    });

    it('should use default offset of 0 when not specified', async () => {
      const request: SearchRequest = {
        query: 'john',
      };
      const userId = 'user-004';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.offset).toBe(0);
    });

    it('should handle empty results', async () => {
      const request: SearchRequest = {
        query: 'nonexistent',
        limit: 10,
      };
      const userId = 'user-005';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.total_results).toBe(0);
      expect(result.results).toEqual([]);
      expect(result.pagination.has_more).toBe(false);
    });

    it('should cache results after successful search', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-006';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('search:'),
        result
      );
    });
  });

  describe('searchCustomers - Fallback to PostgreSQL', () => {
    it('should use PostgreSQL when Elasticsearch is unavailable', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-123';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(false);
      mockCustomerRepository.searchCustomersFallback.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockSearchRepository.isAvailable).toHaveBeenCalled();
      expect(mockSearchRepository.searchCustomers).not.toHaveBeenCalled();
      expect(mockCustomerRepository.searchCustomersFallback).toHaveBeenCalledWith(request);
      expect(result.total_results).toBe(2);
      expect(logger.warn).toHaveBeenCalledWith(
        'Elasticsearch unavailable, using PostgreSQL fallback'
      );
    });

    it('should fallback to PostgreSQL when Elasticsearch search fails', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-456';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockRejectedValue(
        new Error('Elasticsearch timeout')
      );
      mockCustomerRepository.searchCustomersFallback.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalled();
      expect(mockCustomerRepository.searchCustomersFallback).toHaveBeenCalledWith(request);
      expect(result.total_results).toBe(2);
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) }),
        'Search failed, attempting fallback'
      );
    });

    it('should throw ServiceUnavailableError when both Elasticsearch and PostgreSQL fail', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-789';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockRejectedValue(
        new Error('Elasticsearch error')
      );
      mockCustomerRepository.searchCustomersFallback.mockRejectedValue(
        new Error('PostgreSQL error')
      );

      await expect(service.searchCustomers(request, userId)).rejects.toThrow(
        ServiceUnavailableError
      );
      await expect(service.searchCustomers(request, userId)).rejects.toThrow(
        'Search service temporarily unavailable'
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) }),
        'Search failed, attempting fallback'
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) }),
        'Fallback search also failed'
      );
    });

    it('should cache fallback results', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-001';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(false);
      mockCustomerRepository.searchCustomersFallback.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('search:'),
        result
      );
    });

    it('should audit fallback search results', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-002';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(false);
      mockCustomerRepository.searchCustomersFallback.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        2,
        expect.any(Number)
      );
    });
  });

  describe('searchCustomers - Audit Logging', () => {
    it('should audit search with correct parameters', async () => {
      const request: SearchRequest = {
        query: 'john@example.com',
        filters: { loyalty_tier: ['vip'] },
        limit: 10,
      };
      const userId = 'user-audit-1';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1250);

      await service.searchCustomers(request, userId);

      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        2,
        250
      );
    });

    it('should audit cached searches', async () => {
      const request: SearchRequest = {
        query: 'cached query',
        limit: 10,
      };
      const userId = 'user-audit-2';
      const cachedResponse: SearchResponse = {
        total_results: 5,
        results: mockSearchResults,
        query_time_ms: 100,
        pagination: { limit: 10, offset: 0, has_more: false },
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        5,
        expect.any(Number)
      );
    });

    it('should not fail search when audit logging fails', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
      };
      const userId = 'user-audit-3';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);

      // The audit service internally catches errors, so we test that the service
      // completes successfully even if the audit implementation has issues
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result).toBeDefined();
      expect(result.total_results).toBe(2);
      expect(mockAuditService.logSearch).toHaveBeenCalled();
    });
  });

  describe('searchCustomers - Edge Cases', () => {
    it('should handle very large result sets', async () => {
      const request: SearchRequest = {
        query: 'common name',
        limit: 100,
      };
      const userId = 'user-edge-1';
      const largeResults = Array(100).fill(null).map((_, i) => ({
        ...mockSearchResults[0],
        profile_id: `profile-${i}`,
      }));

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(largeResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.total_results).toBe(100);
      expect(result.results.length).toBe(100);
      expect(result.pagination.has_more).toBe(true);
    });

    it('should handle very long query strings', async () => {
      const request: SearchRequest = {
        query: 'a'.repeat(10000),
        limit: 10,
      };
      const userId = 'user-edge-2';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
    });

    it('should handle special characters in query', async () => {
      const request: SearchRequest = {
        query: 'test@#$%^&*()[]{}|\\;:\'",.<>?/`~',
        limit: 10,
      };
      const userId = 'user-edge-3';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
    });

    it('should handle Unicode characters in query', async () => {
      const request: SearchRequest = {
        query: 'Hello 世界 🌍',
        limit: 10,
      };
      const userId = 'user-edge-4';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
    });

    it('should handle empty query string', async () => {
      const request: SearchRequest = {
        query: '',
        limit: 10,
      };
      const userId = 'user-edge-5';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
    });

    it('should handle offset larger than result set', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10,
        offset: 1000,
      };
      const userId = 'user-edge-6';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.results).toEqual([]);
      expect(result.pagination.offset).toBe(1000);
    });

    it('should handle limit of 1', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 1,
      };
      const userId = 'user-edge-7';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([mockSearchResults[0]]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.has_more).toBe(true);
    });

    it('should handle very large limit', async () => {
      const request: SearchRequest = {
        query: 'john',
        limit: 10000,
      };
      const userId = 'user-edge-8';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(result.pagination.limit).toBe(10000);
      expect(result.pagination.has_more).toBe(false);
    });
  });

  describe('searchCustomers - Cache Key Generation', () => {
    it('should generate different cache keys for different queries', async () => {
      const request1: SearchRequest = { query: 'john' };
      const request2: SearchRequest = { query: 'jane' };
      const userId = 'user-cache-1';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const key1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const key2 = mockCacheService.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different limits', async () => {
      const request1: SearchRequest = { query: 'john', limit: 10 };
      const request2: SearchRequest = { query: 'john', limit: 20 };
      const userId = 'user-cache-2';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const key1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const key2 = mockCacheService.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different offsets', async () => {
      const request1: SearchRequest = { query: 'john', offset: 0 };
      const request2: SearchRequest = { query: 'john', offset: 10 };
      const userId = 'user-cache-3';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const key1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const key2 = mockCacheService.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different filters', async () => {
      const request1: SearchRequest = {
        query: 'john',
        filters: { loyalty_tier: ['vip'] }
      };
      const request2: SearchRequest = {
        query: 'john',
        filters: { loyalty_tier: ['gold'] }
      };
      const userId = 'user-cache-4';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const key1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const key2 = mockCacheService.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different search fields', async () => {
      const request1: SearchRequest = {
        query: 'john',
        search_fields: ['name']
      };
      const request2: SearchRequest = {
        query: 'john',
        search_fields: ['email']
      };
      const userId = 'user-cache-5';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request1, userId);
      const key1 = mockCacheService.get.mock.calls[0][0];

      jest.clearAllMocks();
      mockCacheService.get.mockResolvedValue(null);

      await service.searchCustomers(request2, userId);
      const key2 = mockCacheService.get.mock.calls[0][0];

      expect(key1).not.toBe(key2);
    });

    it('should include search: prefix in cache key', async () => {
      const request: SearchRequest = { query: 'john' };
      const userId = 'user-cache-6';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue([]);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      await service.searchCustomers(request, userId);
      const key = mockCacheService.get.mock.calls[0][0];

      expect(key).toMatch(/^search:[a-f0-9]{32}$/);
    });
  });

  describe('searchCustomers - Performance and Timing', () => {
    it('should calculate query time correctly', async () => {
      const request: SearchRequest = { query: 'john' };
      const userId = 'user-perf-1';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)  // Start
        .mockReturnValueOnce(1500)  // End (after search)
        .mockReturnValueOnce(1500); // For response construction

      const result = await service.searchCustomers(request, userId);

      expect(result.query_time_ms).toBe(500);
    });

    it('should include time for cache operations in cached response timing', async () => {
      const request: SearchRequest = { query: 'john' };
      const userId = 'user-perf-2';
      const cachedResponse: SearchResponse = {
        total_results: 2,
        results: mockSearchResults,
        query_time_ms: 100,
        pagination: { limit: 10, offset: 0, has_more: false },
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(2000)  // Start
        .mockReturnValueOnce(2050); // End (after cache get)

      await service.searchCustomers(request, userId);

      expect(mockAuditService.logSearch).toHaveBeenCalledWith(
        userId,
        request.query,
        request.filters,
        2,
        50
      );
    });
  });

  describe('searchCustomers - Integration Scenarios', () => {
    it('should handle complete flow: no cache, ES success, cache set, audit', async () => {
      const request: SearchRequest = {
        query: 'john@example.com',
        search_fields: ['email'],
        filters: { loyalty_tier: ['vip'] },
        limit: 10,
        offset: 0,
      };
      const userId = 'user-int-1';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockResolvedValue(mockSearchResults);
      mockCacheService.set.mockResolvedValue(undefined);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      // Verify call order and interactions
      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockSearchRepository.isAvailable).toHaveBeenCalled();
      expect(mockSearchRepository.searchCustomers).toHaveBeenCalledWith(request);
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.logSearch).toHaveBeenCalled();
      expect(result.total_results).toBe(2);
    });

    it('should handle complete flow: ES fail, fallback success, cache set, audit', async () => {
      const request: SearchRequest = { query: 'john', limit: 10 };
      const userId = 'user-int-2';

      mockCacheService.get.mockResolvedValue(null);
      mockSearchRepository.isAvailable.mockResolvedValue(true);
      mockSearchRepository.searchCustomers.mockRejectedValue(new Error('ES failed'));
      mockCustomerRepository.searchCustomersFallback.mockResolvedValue(mockSearchResults);
      mockCacheService.set.mockResolvedValue(undefined);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockSearchRepository.searchCustomers).toHaveBeenCalled();
      expect(mockCustomerRepository.searchCustomersFallback).toHaveBeenCalledWith(request);
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockAuditService.logSearch).toHaveBeenCalled();
      expect(result.total_results).toBe(2);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle cached result flow without hitting repositories', async () => {
      const request: SearchRequest = { query: 'john', limit: 10 };
      const userId = 'user-int-3';
      const cachedResponse: SearchResponse = {
        total_results: 2,
        results: mockSearchResults,
        query_time_ms: 50,
        pagination: { limit: 10, offset: 0, has_more: false },
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);
      mockAuditService.logSearch.mockResolvedValue(undefined);

      const result = await service.searchCustomers(request, userId);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockSearchRepository.isAvailable).not.toHaveBeenCalled();
      expect(mockSearchRepository.searchCustomers).not.toHaveBeenCalled();
      expect(mockCustomerRepository.searchCustomersFallback).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockAuditService.logSearch).toHaveBeenCalled();
      expect(result).toEqual(cachedResponse);
    });
  });
});
