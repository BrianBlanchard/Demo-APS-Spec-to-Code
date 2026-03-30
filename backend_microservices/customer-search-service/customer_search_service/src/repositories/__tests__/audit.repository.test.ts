import { AuditRepository } from '../audit.repository';
import { Database } from '../database';
import { SearchAuditLog } from '../../types/customer.types';

// Mock crypto module
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

describe('AuditRepository', () => {
  let auditRepository: AuditRepository;
  let mockDatabase: jest.Mocked<Database>;

  beforeEach(() => {
    // Reset crypto mock
    const crypto = require('crypto');
    crypto.randomUUID.mockReturnValue('test-uuid-1234');

    // Create mock database with typed query method
    mockDatabase = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    auditRepository = new AuditRepository(mockDatabase);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logSearch', () => {
    it('should log search with all required fields', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-123',
        query: 'John Doe',
        filters: { loyalty_tier: ['gold'] },
        result_count: 5,
        query_time_ms: 150,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      expect(mockDatabase.query).toHaveBeenCalledTimes(1);

      const sqlCall = mockDatabase.query.mock.calls[0];
      const sql = sqlCall[0];
      const params = sqlCall[1] as unknown[];

      expect(sql).toContain('INSERT INTO search_audit_logs');
      expect(sql).toContain('search_id');
      expect(sql).toContain('user_id');
      expect(sql).toContain('query');
      expect(sql).toContain('filters');
      expect(sql).toContain('result_count');
      expect(sql).toContain('query_time_ms');
      expect(sql).toContain('zero_results');
      expect(sql).toContain('created_at');
      expect(sql).toContain('VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())');

      expect(params).toHaveLength(7);
      expect(params[0]).toBe('test-uuid-1234');
      expect(params[1]).toBe('user-123');
      expect(params[2]).toBe('John Doe');
      expect(params[3]).toBe(JSON.stringify({ loyalty_tier: ['gold'] }));
      expect(params[4]).toBe(5);
      expect(params[5]).toBe(150);
      expect(params[6]).toBe(false);
    });

    it('should set zero_results to true when result_count is 0', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-456',
        query: 'nonexistent',
        result_count: 0,
        query_time_ms: 50,
        zero_results: false, // This should be overridden
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[6]).toBe(true); // zero_results should be true
    });

    it('should set zero_results to false when result_count is greater than 0', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-789',
        query: 'test',
        result_count: 10,
        query_time_ms: 200,
        zero_results: true, // This should be overridden
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[6]).toBe(false); // zero_results should be false
    });

    it('should handle undefined filters', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-111',
        query: 'search term',
        result_count: 3,
        query_time_ms: 100,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[3]).toBe(JSON.stringify({})); // filters should be empty object
    });

    it('should handle null filters', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-222',
        query: 'test',
        filters: null as any,
        result_count: 1,
        query_time_ms: 75,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[3]).toBe(JSON.stringify({}));
    });

    it('should serialize complex filters to JSON', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const complexFilters = {
        loyalty_tier: ['gold', 'vip'],
        store_id: 'store-123',
      };

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-333',
        query: 'complex search',
        filters: complexFilters,
        result_count: 7,
        query_time_ms: 250,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[3]).toBe(JSON.stringify(complexFilters));
    });

    it('should generate unique search_id for each log', async () => {
      const crypto = require('crypto');
      let callCount = 0;
      crypto.randomUUID.mockImplementation(() => {
        callCount++;
        return `test-uuid-${callCount}`;
      });

      mockDatabase.query.mockResolvedValue([]);

      const log1: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-444',
        query: 'first search',
        result_count: 1,
        query_time_ms: 100,
        zero_results: false,
      };

      const log2: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-555',
        query: 'second search',
        result_count: 2,
        query_time_ms: 200,
        zero_results: false,
      };

      await auditRepository.logSearch(log1);
      await auditRepository.logSearch(log2);

      expect(mockDatabase.query).toHaveBeenCalledTimes(2);
      expect((mockDatabase.query.mock.calls[0][1] as unknown[])[0]).toBe('test-uuid-1');
      expect((mockDatabase.query.mock.calls[1][1] as unknown[])[0]).toBe('test-uuid-2');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database insertion failed');
      mockDatabase.query.mockRejectedValue(dbError);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-666',
        query: 'test',
        result_count: 0,
        query_time_ms: 50,
        zero_results: false,
      };

      await expect(auditRepository.logSearch(log)).rejects.toThrow(
        'Database insertion failed'
      );
    });

    it('should handle empty query string', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-777',
        query: '',
        result_count: 0,
        query_time_ms: 10,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[2]).toBe('');
      expect(params[6]).toBe(true); // zero_results should be true for 0 results
    });

    it('should handle special characters in query', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-888',
        query: "John's \"special\" <query>",
        result_count: 2,
        query_time_ms: 150,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[2]).toBe("John's \"special\" <query>");
    });

    it('should handle very long query strings', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const longQuery = 'a'.repeat(1000);
      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-999',
        query: longQuery,
        result_count: 0,
        query_time_ms: 500,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[2]).toBe(longQuery);
    });

    it('should handle zero query_time_ms', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-000',
        query: 'instant',
        result_count: 1,
        query_time_ms: 0,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[5]).toBe(0);
    });

    it('should handle very large query_time_ms', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-slow',
        query: 'slow query',
        result_count: 100,
        query_time_ms: 30000,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[5]).toBe(30000);
    });

    it('should handle very large result_count', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-many',
        query: 'popular',
        result_count: 999999,
        query_time_ms: 1000,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[4]).toBe(999999);
      expect(params[6]).toBe(false); // zero_results should be false
    });

    it('should handle filters with nested objects', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const complexFilters = {
        loyalty_tier: ['gold'],
        custom: {
          nested: {
            value: 123,
          },
        },
      };

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-nested',
        query: 'nested filters',
        filters: complexFilters,
        result_count: 1,
        query_time_ms: 200,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[3]).toBe(JSON.stringify(complexFilters));
      expect(JSON.parse(params[3] as string)).toEqual(complexFilters);
    });

    it('should handle concurrent log insertions', async () => {
      const crypto = require('crypto');
      let callCount = 0;
      crypto.randomUUID.mockImplementation(() => {
        callCount++;
        return `concurrent-uuid-${callCount}`;
      });

      mockDatabase.query.mockResolvedValue([]);

      const logs = [
        {
          user_id: 'user-1',
          query: 'query 1',
          result_count: 1,
          query_time_ms: 100,
          zero_results: false,
        },
        {
          user_id: 'user-2',
          query: 'query 2',
          result_count: 2,
          query_time_ms: 200,
          zero_results: false,
        },
        {
          user_id: 'user-3',
          query: 'query 3',
          result_count: 0,
          query_time_ms: 50,
          zero_results: false,
        },
      ];

      const promises = logs.map(log => auditRepository.logSearch(log));
      await Promise.all(promises);

      expect(mockDatabase.query).toHaveBeenCalledTimes(3);
    });

    it('should use NOW() for created_at timestamp', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-timestamp',
        query: 'timestamp test',
        result_count: 1,
        query_time_ms: 100,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const sql = mockDatabase.query.mock.calls[0][0];
      expect(sql).toContain('NOW()');
    });

    it('should handle empty filters object', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-empty-filters',
        query: 'no filters',
        filters: {},
        result_count: 5,
        query_time_ms: 100,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[3]).toBe(JSON.stringify({}));
    });

    it('should maintain parameter order', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'test-user',
        query: 'test-query',
        filters: { key: 'value' },
        result_count: 42,
        query_time_ms: 123,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;

      // Verify exact parameter order
      expect(params[0]).toBe('test-uuid-1234'); // search_id
      expect(params[1]).toBe('test-user'); // user_id
      expect(params[2]).toBe('test-query'); // query
      expect(params[3]).toBe(JSON.stringify({ key: 'value' })); // filters
      expect(params[4]).toBe(42); // result_count
      expect(params[5]).toBe(123); // query_time_ms
      expect(params[6]).toBe(false); // zero_results
    });
  });

  describe('Edge cases', () => {
    it('should handle database connection timeout', async () => {
      const timeoutError = new Error('Connection timeout');
      mockDatabase.query.mockRejectedValue(timeoutError);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-timeout',
        query: 'timeout test',
        result_count: 0,
        query_time_ms: 5000,
        zero_results: false,
      };

      await expect(auditRepository.logSearch(log)).rejects.toThrow(
        'Connection timeout'
      );
    });

    it('should handle SQL injection attempts in user_id', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: "user'; DROP TABLE search_audit_logs; --",
        query: 'test',
        result_count: 0,
        query_time_ms: 100,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      // Parameterized query should safely handle this
      expect(mockDatabase.query).toHaveBeenCalled();
      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[1]).toBe("user'; DROP TABLE search_audit_logs; --");
    });

    it('should handle Unicode characters in query', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const log: Omit<SearchAuditLog, 'search_id' | 'created_at'> = {
        user_id: 'user-unicode',
        query: '日本語 emoji 🔍 Ñoño',
        result_count: 1,
        query_time_ms: 100,
        zero_results: false,
      };

      await auditRepository.logSearch(log);

      const params = mockDatabase.query.mock.calls[0][1]!;
      expect(params[2]).toBe('日本語 emoji 🔍 Ñoño');
    });
  });
});
