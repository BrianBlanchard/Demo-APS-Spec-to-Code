import { SearchRepository } from '../search.repository';
import { ElasticsearchClient } from '../elasticsearch.client';
import { SearchRequest } from '../../types/customer.types';

// Mock logger to prevent console output during tests
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock config
jest.mock('../../config', () => ({
  config: {
    elasticsearch: {
      index: 'customer-profiles',
      node: 'http://localhost:9200',
      requestTimeout: 5000,
    },
  },
}));

describe('SearchRepository', () => {
  let searchRepository: SearchRepository;
  let mockEsClient: jest.Mocked<ElasticsearchClient>;
  let mockClient: any;

  beforeEach(() => {
    // Create mock Elasticsearch client
    mockClient = {
      search: jest.fn(),
      cluster: {
        health: jest.fn(),
      },
    };

    mockEsClient = {
      getClient: jest.fn(() => mockClient),
      healthCheck: jest.fn(),
    } as unknown as jest.Mocked<ElasticsearchClient>;

    searchRepository = new SearchRepository(mockEsClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchCustomers', () => {
    it('should perform basic search query', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123456',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 8.5,
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'John Doe',
        limit: 10,
        offset: 0,
      };

      const results = await searchRepository.searchCustomers(request);

      expect(mockClient.search).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        profile_id: 'cust-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+14155551234',
        match_score: 85,
        highlights: {},
      });
    });

    it('should use default search fields when not specified', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match).toBeDefined();
      expect(body.query.bool.must[0].multi_match.fields).toContain('first_name^2');
      expect(body.query.bool.must[0].multi_match.fields).toContain('last_name^2');
      expect(body.query.bool.must[0].multi_match.fields).toContain('email');
      expect(body.query.bool.must[0].multi_match.fields).toContain('phone');
      expect(body.query.bool.must[0].multi_match.fields).toContain('loyalty_card');
    });

    it('should detect and handle email-like queries', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'john.doe@example.com',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].match).toBeDefined();
      expect(body.query.bool.must[0].match.email).toBeDefined();
      expect(body.query.bool.must[0].match.email.query).toBe('john.doe@example.com');
      expect(body.query.bool.must[0].match.email.fuzziness).toBe(0);
    });

    it('should detect and handle phone-like queries', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: '(415) 555-1234',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].terms).toBeDefined();
      expect(body.query.bool.must[0].terms.phone).toBeDefined();
      expect(Array.isArray(body.query.bool.must[0].terms.phone)).toBe(true);
    });

    it('should apply loyalty_tier filter', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        filters: {
          loyalty_tier: ['gold', 'vip'],
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.filter).toHaveLength(1);
      expect(body.query.bool.filter[0].terms).toBeDefined();
      expect(body.query.bool.filter[0].terms.loyalty_tier).toEqual(['gold', 'vip']);
    });

    it('should apply store_id filter', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        filters: {
          store_id: 'store-123',
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.filter).toHaveLength(1);
      expect(body.query.bool.filter[0].term).toBeDefined();
      expect(body.query.bool.filter[0].term.last_visit_store).toBe('store-123');
    });

    it('should apply both loyalty_tier and store_id filters', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        filters: {
          loyalty_tier: ['silver'],
          store_id: 'store-456',
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.filter).toHaveLength(2);
    });

    it('should not apply filters when not provided', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.filter).toEqual([]);
    });

    it('should not apply loyalty_tier filter for empty array', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        filters: {
          loyalty_tier: [],
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.filter).toEqual([]);
    });

    it('should use correct index name from config', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      expect(searchCall.index).toBe('customer-profiles');
    });

    it('should apply pagination with limit and offset', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        limit: 25,
        offset: 50,
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.size).toBe(25);
      expect(body.from).toBe(50);
    });

    it('should use default limit and offset', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.size).toBe(10);
      expect(body.from).toBe(0);
    });

    it('should sort by score and last_activity', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.sort).toEqual([
        { _score: { order: 'desc' } },
        { last_activity: { order: 'desc' } },
      ]);
    });

    it('should include highlight configuration', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.highlight).toBeDefined();
      expect(body.highlight.fields).toHaveProperty('first_name');
      expect(body.highlight.fields).toHaveProperty('last_name');
      expect(body.highlight.fields).toHaveProperty('email');
      expect(body.highlight.fields).toHaveProperty('phone');
      expect(body.highlight.fields).toHaveProperty('loyalty_card');
      expect(body.highlight.pre_tags).toEqual(['<em>']);
      expect(body.highlight.post_tags).toEqual(['</em>']);
    });

    it('should transform highlights for name fields', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {
                first_name: ['<em>John</em>'],
                last_name: ['<em>Doe</em>'],
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'John Doe',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights.name).toBe('<em>John</em> <em>Doe</em>');
    });

    it('should transform highlights for email field', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {
                email: ['<em>john</em>@example.com'],
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'john@example.com',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights.email).toBe('<em>john</em>@example.com');
    });

    it('should transform highlights for phone field', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {
                phone: ['<em>+14155551234</em>'],
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: '4155551234',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights.phone).toBe('<em>+14155551234</em>');
    });

    it('should transform highlights for loyalty_card field', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123456',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {
                loyalty_card: ['<em>LC123456</em>'],
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'LC123456',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights.loyalty_card).toBe('<em>LC123456</em>');
    });

    it('should handle partial name highlights', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {
                first_name: ['<em>John</em>'],
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'John',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights.name).toBe('<em>John</em> Doe');
    });

    it('should normalize match score to 0-100 range', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 15.5,
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'test',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].match_score).toBe(100); // 15.5 * 10 = 155, capped at 100
    });

    it('should handle zero score', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 0,
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'test',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].match_score).toBe(0);
    });

    it('should handle missing score', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'test',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].match_score).toBe(0);
    });

    it('should return empty array when no results', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'nonexistent',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results).toEqual([]);
    });

    it('should handle multiple results', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john1@example.com',
                phone: '+14155551111',
                loyalty_card: 'LC111',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 8.5,
              highlight: {},
            },
            {
              _source: {
                profile_id: 'cust-002',
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'jane@example.com',
                phone: '+14155552222',
                loyalty_card: 'LC222',
                loyalty_tier: 'vip',
                last_activity: '2026-03-21T10:30:00Z',
                last_visit_store: 'store-002',
              },
              _score: 7.5,
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'Doe',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results).toHaveLength(2);
      expect(results[0].profile_id).toBe('cust-001');
      expect(results[1].profile_id).toBe('cust-002');
    });

    it('should handle Elasticsearch errors', async () => {
      const esError = new Error('Connection refused');
      mockClient.search.mockRejectedValue(esError);

      const request: SearchRequest = {
        query: 'test',
      };

      await expect(searchRepository.searchCustomers(request)).rejects.toThrow(
        'Connection refused'
      );
    });

    it('should use custom search_fields when provided', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        search_fields: ['email', 'phone'],
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match.fields).toEqual(['email', 'phone']);
    });

    it('should expand name field to first_name and last_name with boost', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        search_fields: ['name', 'email'],
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match.fields).toContain('first_name^2');
      expect(body.query.bool.must[0].multi_match.fields).toContain('last_name^2');
      expect(body.query.bool.must[0].multi_match.fields).toContain('email');
    });

    it('should use multi_match with fuzzy matching for general queries', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'jonhn', // Typo in name
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match).toBeDefined();
      expect(body.query.bool.must[0].multi_match.fuzziness).toBe('AUTO');
      expect(body.query.bool.must[0].multi_match.type).toBe('best_fields');
      expect(body.query.bool.must[0].multi_match.operator).toBe('or');
    });

    it('should handle empty highlights object', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
              highlight: {},
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'test',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights).toEqual({});
    });

    it('should handle missing highlight field', async () => {
      const mockEsResponse = {
        hits: {
          hits: [
            {
              _source: {
                profile_id: 'cust-001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+14155551234',
                loyalty_card: 'LC123',
                loyalty_tier: 'gold',
                last_activity: '2026-03-20T10:30:00Z',
                last_visit_store: 'store-001',
              },
              _score: 5.0,
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockEsResponse);

      const request: SearchRequest = {
        query: 'test',
      };

      const results = await searchRepository.searchCustomers(request);

      expect(results[0].highlights).toEqual({});
    });
  });

  describe('isAvailable', () => {
    it('should return true when Elasticsearch is available', async () => {
      mockEsClient.healthCheck.mockResolvedValue(true);

      const result = await searchRepository.isAvailable();

      expect(result).toBe(true);
      expect(mockEsClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('should return false when Elasticsearch is unavailable', async () => {
      mockEsClient.healthCheck.mockResolvedValue(false);

      const result = await searchRepository.isAvailable();

      expect(result).toBe(false);
      expect(mockEsClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('should handle health check errors', async () => {
      mockEsClient.healthCheck.mockRejectedValue(new Error('Connection failed'));

      await expect(searchRepository.isAvailable()).rejects.toThrow('Connection failed');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long query strings', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const longQuery = 'a'.repeat(1000);
      const request: SearchRequest = {
        query: longQuery,
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match.query).toBe(longQuery);
    });

    it('should handle special characters in query', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: "John's \"special\" <query>",
      };

      await searchRepository.searchCustomers(request);

      expect(mockClient.search).toHaveBeenCalled();
    });

    it('should handle Unicode characters in query', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: '日本語 emoji 🔍',
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].multi_match.query).toBe('日本語 emoji 🔍');
    });

    it('should handle empty query string', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: '',
      };

      await searchRepository.searchCustomers(request);

      expect(mockClient.search).toHaveBeenCalled();
    });

    it('should handle concurrent searches', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const requests = [
        { query: 'John' },
        { query: 'Jane' },
        { query: 'Bob' },
      ];

      const promises = requests.map(req => searchRepository.searchCustomers(req));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockClient.search).toHaveBeenCalledTimes(3);
    });

    it('should handle very large limit values', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'test',
        limit: 10000,
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.size).toBe(10000);
    });

    it('should handle combined email and filters', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: 'user@example.com',
        filters: {
          loyalty_tier: ['gold'],
          store_id: 'store-123',
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].match.email).toBeDefined();
      expect(body.query.bool.filter).toHaveLength(2);
    });

    it('should handle combined phone and filters', async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const request: SearchRequest = {
        query: '4155551234',
        filters: {
          loyalty_tier: ['vip'],
        },
      };

      await searchRepository.searchCustomers(request);

      const searchCall = mockClient.search.mock.calls[0][0];
      const body = searchCall.body;

      expect(body.query.bool.must[0].terms.phone).toBeDefined();
      expect(body.query.bool.filter).toHaveLength(1);
    });
  });
});
