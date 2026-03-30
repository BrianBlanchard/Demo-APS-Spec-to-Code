import { CustomerRepository } from '../customer.repository';
import { Database } from '../database';
import { SearchRequest, CustomerProfile, SearchResult } from '../../types/customer.types';

// Mock logger to prevent console output during tests
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    // Create mock database with typed query method
    mockDatabase = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    customerRepository = new CustomerRepository(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchCustomersFallback', () => {
    it('should search customers with basic query', async () => {
      const mockResults: CustomerProfile[] = [
        {
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
      ];

      mockDatabase.query.mockResolvedValue(mockResults);

      const request: SearchRequest = {
        query: 'John',
        limit: 10,
        offset: 0,
      };

      const results = await customerRepository.searchCustomersFallback(request);

      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        profile_id: 'cust-001',
        first_name: 'John',
        last_name: 'Doe',
        match_score: 50,
        highlights: {},
      });
    });

    it('should construct SQL query with wildcard search', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'doe',
        limit: 20,
        offset: 5,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('ILIKE $1');
      expect(sql).toContain('first_name ILIKE $1');
      expect(sql).toContain('last_name ILIKE $1');
      expect(sql).toContain('email ILIKE $1');
      expect(sql).toContain('loyalty_card ILIKE $1');
      expect(sql).toContain('phone ILIKE $1');
      expect(sql).toContain('ORDER BY last_activity DESC');
      expect(params).toEqual(['%doe%', 20, 5]);
    });

    it('should handle phone number queries with normalization', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: '(415) 555-1234',
        limit: 10,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      // Should include OR phone = $5 for normalized phone
      expect(sql).toContain('OR phone = $5');
      expect(params).toHaveLength(4);
      expect(params[0]).toBe('%(415) 555-1234%');
      expect(params[1]).toBe(10);
      expect(params[2]).toBe(0);
      expect(params[3]).toBe('+14155551234'); // Normalized phone
    });

    it('should apply loyalty_tier filter when provided', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'John',
        filters: {
          loyalty_tier: ['gold', 'vip'],
        },
        limit: 10,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('loyalty_tier = ANY($2)');
      expect(params[0]).toBe('%John%');
      expect(params[1]).toEqual(['gold', 'vip']);
      expect(params[2]).toBe(10);
      expect(params[3]).toBe(0);
    });

    it('should apply store_id filter when provided', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'Jane',
        filters: {
          store_id: 'store-123',
        },
        limit: 10,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('last_visit_store = $2');
      expect(params[0]).toBe('%Jane%');
      expect(params[1]).toBe('store-123');
      expect(params[2]).toBe(10);
      expect(params[3]).toBe(0);
    });

    it('should apply both loyalty_tier and store_id filters', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'Smith',
        filters: {
          loyalty_tier: ['silver'],
          store_id: 'store-456',
        },
        limit: 15,
        offset: 10,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('loyalty_tier = ANY($2)');
      expect(sql).toContain('last_visit_store = $3');
      expect(params[0]).toBe('%Smith%');
      expect(params[1]).toEqual(['silver']);
      expect(params[2]).toBe('store-456');
      expect(params[3]).toBe(15);
      expect(params[4]).toBe(10);
    });

    it('should use default limit and offset when not provided', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'test',
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const params = sqlCall[1]!;

      expect(params).toContain(10); // Default limit
      expect(params).toContain(0); // Default offset
    });

    it('should return empty array when no results found', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'nonexistent',
        limit: 10,
        offset: 0,
      };

      const results = await customerRepository.searchCustomersFallback(request);

      expect(results).toEqual([]);
    });

    it('should transform database rows to SearchResult format', async () => {
      const mockResults: CustomerProfile[] = [
        {
          profile_id: 'cust-001',
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice.j@example.com',
          phone: '+15555551111',
          loyalty_card: 'LC999999',
          loyalty_tier: 'vip',
          last_activity: '2026-03-25T14:20:00Z',
          last_visit_store: 'store-789',
        },
        {
          profile_id: 'cust-002',
          first_name: 'Bob',
          last_name: 'Williams',
          email: 'bob.w@example.com',
          phone: '+15555552222',
          loyalty_card: 'LC888888',
          loyalty_tier: 'silver',
          last_activity: '2026-03-24T09:15:00Z',
          last_visit_store: 'store-123',
        },
      ];

      mockDatabase.query.mockResolvedValue(mockResults);

      const request: SearchRequest = {
        query: 'customer',
        limit: 10,
        offset: 0,
      };

      const results = await customerRepository.searchCustomersFallback(request);

      expect(results).toHaveLength(2);

      results.forEach((result: SearchResult) => {
        expect(result).toHaveProperty('profile_id');
        expect(result).toHaveProperty('first_name');
        expect(result).toHaveProperty('last_name');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('phone');
        expect(result).toHaveProperty('loyalty_card');
        expect(result).toHaveProperty('loyalty_tier');
        expect(result).toHaveProperty('last_activity');
        expect(result).toHaveProperty('last_visit_store');
        expect(result).toHaveProperty('match_score');
        expect(result).toHaveProperty('highlights');
        expect(result.match_score).toBe(50);
        expect(result.highlights).toEqual({});
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabase.query.mockRejectedValue(dbError);

      const request: SearchRequest = {
        query: 'test',
        limit: 10,
        offset: 0,
      };

      await expect(
        customerRepository.searchCustomersFallback(request)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle phone queries with less than 10 digits (no normalization)', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: '123', // Less than 10 digits
        limit: 10,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      // Should NOT include OR phone = $5 for normalized phone
      expect(sql).not.toContain('OR phone = $5');
      expect(params).toHaveLength(3);
      expect(params[0]).toBe('%123%');
      expect(params[1]).toBe(10);
      expect(params[2]).toBe(0);
    });

    it('should handle complex phone query with filters', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: '555-123-4567',
        filters: {
          loyalty_tier: ['gold'],
          store_id: 'store-001',
        },
        limit: 5,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('loyalty_tier = ANY($2)');
      expect(sql).toContain('last_visit_store = $3');
      expect(sql).toContain('OR phone = $5');
      expect(params).toHaveLength(6);
      expect(params[0]).toBe('%555-123-4567%');
      expect(params[1]).toEqual(['gold']);
      expect(params[2]).toBe('store-001');
      expect(params[3]).toBe(5);
      expect(params[4]).toBe(0);
      expect(params[5]).toBe('+15551234567');
    });
  });

  describe('getCustomerById', () => {
    it('should retrieve customer by profile_id', async () => {
      const mockCustomer: CustomerProfile = {
        profile_id: 'cust-123',
        first_name: 'Sarah',
        last_name: 'Connor',
        email: 'sarah.connor@example.com',
        phone: '+15555559999',
        loyalty_card: 'LC111111',
        loyalty_tier: 'gold',
        last_activity: '2026-03-26T16:45:00Z',
        last_visit_store: 'store-002',
      };

      mockDatabase.query.mockResolvedValue([mockCustomer]);

      const result = await customerRepository.getCustomerById('cust-123');

      expect(mockDatabase.query).toHaveBeenCalledTimes(1);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['cust-123']
      );
      expect(result).toEqual(mockCustomer);
    });

    it('should construct correct SQL query', async () => {
      mockDatabase.query.mockResolvedValue([]);

      await customerRepository.getCustomerById('test-id');

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1]!;

      expect(sql).toContain('SELECT');
      expect(sql).toContain('FROM customer_profiles');
      expect(sql).toContain('WHERE profile_id = $1');
      expect(sql).toContain('profile_id');
      expect(sql).toContain('first_name');
      expect(sql).toContain('last_name');
      expect(sql).toContain('email');
      expect(sql).toContain('phone');
      expect(sql).toContain('loyalty_card');
      expect(sql).toContain('loyalty_tier');
      expect(sql).toContain('last_activity');
      expect(sql).toContain('last_visit_store');
      expect(params).toEqual(['test-id']);
    });

    it('should return null when customer not found', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const result = await customerRepository.getCustomerById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should return first customer when multiple rows returned', async () => {
      const mockCustomers: CustomerProfile[] = [
        {
          profile_id: 'cust-001',
          first_name: 'First',
          last_name: 'Customer',
          email: 'first@example.com',
          phone: '+15555551111',
          loyalty_card: 'LC111111',
          loyalty_tier: 'gold',
          last_activity: '2026-03-26T10:00:00Z',
          last_visit_store: 'store-001',
        },
        {
          profile_id: 'cust-001',
          first_name: 'Second',
          last_name: 'Customer',
          email: 'second@example.com',
          phone: '+15555552222',
          loyalty_card: 'LC222222',
          loyalty_tier: 'silver',
          last_activity: '2026-03-26T11:00:00Z',
          last_visit_store: 'store-002',
        },
      ];

      mockDatabase.query.mockResolvedValue(mockCustomers);

      const result = await customerRepository.getCustomerById('cust-001');

      expect(result).toEqual(mockCustomers[0]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Connection timeout');
      mockDatabase.query.mockRejectedValue(dbError);

      await expect(
        customerRepository.getCustomerById('cust-123')
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle special characters in profile_id', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const specialId = "cust-'123\"--";
      await customerRepository.getCustomerById(specialId);

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.any(String),
        [specialId]
      );
    });

    it('should handle empty string profile_id', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const result = await customerRepository.getCustomerById('');

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.any(String),
        ['']
      );
      expect(result).toBeNull();
    });

    it('should return complete customer profile with all fields', async () => {
      const completeProfile: CustomerProfile = {
        profile_id: 'cust-complete',
        first_name: 'John',
        last_name: 'Complete',
        email: 'complete@test.com',
        phone: '+15551234567',
        loyalty_card: 'LC999999',
        loyalty_tier: 'vip',
        last_activity: '2026-03-27T12:00:00Z',
        last_visit_store: 'store-vip',
      };

      mockDatabase.query.mockResolvedValue([completeProfile]);

      const result = await customerRepository.getCustomerById('cust-complete');

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        profile_id: 'cust-complete',
        first_name: 'John',
        last_name: 'Complete',
        email: 'complete@test.com',
        phone: '+15551234567',
        loyalty_card: 'LC999999',
        loyalty_tier: 'vip',
        last_activity: '2026-03-27T12:00:00Z',
        last_visit_store: 'store-vip',
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle concurrent searches', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const requests = [
        { query: 'John', limit: 10, offset: 0 },
        { query: 'Jane', limit: 10, offset: 0 },
        { query: 'Bob', limit: 10, offset: 0 },
      ];

      const promises = requests.map(req =>
        customerRepository.searchCustomersFallback(req)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockDatabase.query).toHaveBeenCalledTimes(3);
    });

    it('should handle very large limit values', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'test',
        limit: 1000,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const params = sqlCall[1]!;

      expect(params).toContain(1000);
    });

    it('should handle very large offset values', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'test',
        limit: 10,
        offset: 50000,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const params = sqlCall[1]!;

      expect(params).toContain(50000);
    });

    it('should handle empty loyalty_tier array', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const request: SearchRequest = {
        query: 'test',
        filters: {
          loyalty_tier: [],
        },
        limit: 10,
        offset: 0,
      };

      await customerRepository.searchCustomersFallback(request);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];

      // Should not include loyalty_tier filter for empty array
      expect(sql).not.toContain('loyalty_tier = ANY');
    });
  });
});
