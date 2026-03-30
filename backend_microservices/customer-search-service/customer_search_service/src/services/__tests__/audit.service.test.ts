import { AuditService } from '../audit.service';
import { IAuditRepository } from '../../repositories/audit.repository';
import { logger } from '../../utils/logger';
import { maskSensitiveData } from '../../utils/query.utils';

jest.mock('../../utils/query.utils', () => ({
  maskSensitiveData: jest.fn((data) => `masked:${data}`),
}));

describe('AuditService', () => {
  let auditService: AuditService;
  let mockAuditRepository: jest.Mocked<IAuditRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock audit repository
    mockAuditRepository = {
      logSearch: jest.fn(),
    } as jest.Mocked<IAuditRepository>;

    auditService = new AuditService(mockAuditRepository);
  });

  describe('constructor', () => {
    it('should create instance with default repository', () => {
      const service = new AuditService();
      expect(service).toBeInstanceOf(AuditService);
    });
  });

  describe('logSearch', () => {
    it('should log search with all parameters and mask sensitive data', async () => {
      const userId = 'user123';
      const query = 'john@example.com';
      const filters = { loyalty_tier: ['vip'], store_id: 'store-001' };
      const resultCount = 5;
      const queryTimeMs = 150;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith({
        user_id: userId,
        query,
        filters,
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: false,
      });

      expect(maskSensitiveData).toHaveBeenCalledWith(userId);
      expect(maskSensitiveData).toHaveBeenCalledWith(query);

      expect(logger.info).toHaveBeenCalledWith(
        {
          userId: 'masked:user123',
          query: 'masked:john@example.com',
          resultCount: 5,
          queryTimeMs: 150,
          zeroResults: false,
        },
        'Search audit logged'
      );
    });

    it('should log search with zero results', async () => {
      const userId = 'user456';
      const query = 'nonexistent@example.com';
      const filters = { loyalty_tier: ['gold'] };
      const resultCount = 0;
      const queryTimeMs = 75;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith({
        user_id: userId,
        query,
        filters,
        result_count: 0,
        query_time_ms: queryTimeMs,
        zero_results: true,
      });

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          zeroResults: true,
          resultCount: 0,
        }),
        'Search audit logged'
      );
    });

    it('should log search without filters', async () => {
      const userId = 'user789';
      const query = 'Jane Smith';
      const filters = undefined;
      const resultCount = 3;
      const queryTimeMs = 200;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith({
        user_id: userId,
        query,
        filters: undefined,
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: false,
      });
    });

    it('should log search with empty filters object', async () => {
      const userId = 'user000';
      const query = 'test';
      const filters = {};
      const resultCount = 10;
      const queryTimeMs = 100;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith({
        user_id: userId,
        query,
        filters: {},
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: false,
      });
    });

    it('should handle complex filter structures', async () => {
      const userId = 'user111';
      const query = 'test query';
      const filters = {
        loyalty_tier: ['vip', 'gold', 'silver'],
        store_id: 'store-999',
        additional: { nested: { data: 'value' } },
      };
      const resultCount = 15;
      const queryTimeMs = 250;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith({
        user_id: userId,
        query,
        filters,
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: false,
      });
    });

    it('should handle very fast queries (low query time)', async () => {
      const userId = 'user222';
      const query = 'quick';
      const filters = undefined;
      const resultCount = 1;
      const queryTimeMs = 1;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_time_ms: 1,
        })
      );
    });

    it('should handle very slow queries (high query time)', async () => {
      const userId = 'user333';
      const query = 'slow query';
      const filters = undefined;
      const resultCount = 100;
      const queryTimeMs = 5000;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_time_ms: 5000,
        })
      );
    });

    it('should handle large result counts', async () => {
      const userId = 'user444';
      const query = 'popular search';
      const filters = undefined;
      const resultCount = 10000;
      const queryTimeMs = 300;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          result_count: 10000,
        })
      );
    });

    it('should handle empty query string', async () => {
      const userId = 'user555';
      const query = '';
      const filters = undefined;
      const resultCount = 0;
      const queryTimeMs = 50;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '',
        })
      );
    });

    it('should handle special characters in query', async () => {
      const userId = 'user666';
      const query = 'test@#$%^&*()[]{}|\\;:\'",.<>?/`~';
      const filters = undefined;
      const resultCount = 2;
      const queryTimeMs = 120;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query,
        })
      );
    });

    it('should handle Unicode characters in query', async () => {
      const userId = 'user777';
      const query = 'Hello 世界 🌍';
      const filters = undefined;
      const resultCount = 1;
      const queryTimeMs = 90;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query,
        })
      );
    });

    it('should handle very long query strings', async () => {
      const userId = 'user888';
      const query = 'a'.repeat(10000);
      const filters = undefined;
      const resultCount = 0;
      const queryTimeMs = 500;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query,
        })
      );
    });

    it('should not throw when repository fails', async () => {
      const userId = 'user999';
      const query = 'test';
      const filters = undefined;
      const resultCount = 5;
      const queryTimeMs = 100;

      const error = new Error('Database connection failed');
      mockAuditRepository.logSearch.mockRejectedValue(error);

      await expect(
        auditService.logSearch(userId, query, filters, resultCount, queryTimeMs)
      ).resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        { error },
        'Failed to log search audit'
      );
    });

    it('should not throw when repository throws timeout error', async () => {
      const userId = 'user1001';
      const query = 'timeout test';
      const filters = undefined;
      const resultCount = 3;
      const queryTimeMs = 150;

      const error = new Error('Query timeout');
      mockAuditRepository.logSearch.mockRejectedValue(error);

      await expect(
        auditService.logSearch(userId, query, filters, resultCount, queryTimeMs)
      ).resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        { error },
        'Failed to log search audit'
      );
    });

    it('should not throw when repository throws network error', async () => {
      const userId = 'user1002';
      const query = 'network test';
      const filters = { loyalty_tier: ['vip'] };
      const resultCount = 7;
      const queryTimeMs = 200;

      const error = new Error('ECONNREFUSED');
      mockAuditRepository.logSearch.mockRejectedValue(error);

      await expect(
        auditService.logSearch(userId, query, filters, resultCount, queryTimeMs)
      ).resolves.not.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        { error },
        'Failed to log search audit'
      );
    });

    it('should handle null filters explicitly', async () => {
      const userId = 'user1003';
      const query = 'null filters test';
      const filters = null as any;
      const resultCount = 4;
      const queryTimeMs = 110;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: null,
        })
      );
    });

    it('should detect zero results correctly with boundary value', async () => {
      const userId = 'user1004';
      const query = 'boundary test';
      const filters = undefined;
      const resultCount = 0;
      const queryTimeMs = 80;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      const call = mockAuditRepository.logSearch.mock.calls[0][0];
      expect(call.zero_results).toBe(true);
      expect(call.result_count).toBe(0);
    });

    it('should detect non-zero results correctly with boundary value', async () => {
      const userId = 'user1005';
      const query = 'boundary test 2';
      const filters = undefined;
      const resultCount = 1;
      const queryTimeMs = 85;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      const call = mockAuditRepository.logSearch.mock.calls[0][0];
      expect(call.zero_results).toBe(false);
      expect(call.result_count).toBe(1);
    });

    it('should handle repository success and still log info', async () => {
      const userId = 'user1006';
      const query = 'success test';
      const filters = { store_id: 'store-123' };
      const resultCount = 8;
      const queryTimeMs = 175;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should call maskSensitiveData for both userId and query', async () => {
      const userId = 'sensitive-user-id';
      const query = 'sensitive-query-data';
      const filters = undefined;
      const resultCount = 3;
      const queryTimeMs = 95;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      expect(maskSensitiveData).toHaveBeenCalledWith(userId);
      expect(maskSensitiveData).toHaveBeenCalledWith(query);
      expect(maskSensitiveData).toHaveBeenCalledTimes(2);
    });

    it('should include all required fields in log entry', async () => {
      const userId = 'user1007';
      const query = 'complete test';
      const filters = { loyalty_tier: ['gold'] };
      const resultCount = 6;
      const queryTimeMs = 140;

      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      await auditService.logSearch(userId, query, filters, resultCount, queryTimeMs);

      const logEntry = mockAuditRepository.logSearch.mock.calls[0][0];
      expect(logEntry).toEqual({
        user_id: userId,
        query,
        filters,
        result_count: resultCount,
        query_time_ms: queryTimeMs,
        zero_results: false,
      });
    });

    it('should handle concurrent audit logging', async () => {
      mockAuditRepository.logSearch.mockResolvedValue(undefined);

      const promises = [
        auditService.logSearch('user1', 'query1', undefined, 1, 100),
        auditService.logSearch('user2', 'query2', undefined, 2, 200),
        auditService.logSearch('user3', 'query3', undefined, 3, 300),
      ];

      await Promise.all(promises);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure in concurrent logging', async () => {
      mockAuditRepository.logSearch
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);

      const promises = [
        auditService.logSearch('user1', 'query1', undefined, 1, 100),
        auditService.logSearch('user2', 'query2', undefined, 2, 200),
        auditService.logSearch('user3', 'query3', undefined, 3, 300),
      ];

      await Promise.all(promises);

      expect(mockAuditRepository.logSearch).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
