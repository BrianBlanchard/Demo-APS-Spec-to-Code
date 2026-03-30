import { TransactionSearchService } from '../transaction-search.service';
import { ITransactionRepository } from '../../repositories/transaction.repository';
import { IAuditService } from '../audit.service';
import { IAuthorizationService } from '../authorization.service';
import { AppError } from '../../middleware/error.middleware';
import { requestContextStorage } from '../../utils/context.storage';
import { RequestContext, Transaction } from '../../types';

describe('TransactionSearchService - Business/Service Layer', () => {
  let service: TransactionSearchService;
  let mockRepository: jest.Mocked<ITransactionRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;
  let mockAuthService: jest.Mocked<IAuthorizationService>;

  beforeEach(() => {
    mockRepository = {
      searchTransactions: jest.fn(),
    };

    mockAuditService = {
      logSearchAttempt: jest.fn(),
      logSearchSuccess: jest.fn(),
      logSearchFailure: jest.fn(),
    };

    mockAuthService = {
      validateAccountAccess: jest.fn(),
      validateCardAccess: jest.fn(),
    };

    service = new TransactionSearchService(mockRepository, mockAuditService, mockAuthService);
  });

  describe('searchTransactions', () => {
    const mockTransactions: Transaction[] = [
      {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        cardNumber: '************1234',
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5411',
        amount: 125.5,
        description: 'AMAZON.COM',
        merchantName: 'AMAZON.COM',
        merchantCity: 'Seattle',
        originalTimestamp: '2024-01-15T14:30:00Z',
        postedTimestamp: '2024-01-15T14:30:05Z',
        status: 'posted',
      },
      {
        transactionId: '1234567890123457',
        accountId: '12345678901',
        cardNumber: '************1234',
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        amount: 45.0,
        description: 'STARBUCKS',
        merchantName: 'STARBUCKS',
        merchantCity: 'New York',
        originalTimestamp: '2024-01-16T09:15:00Z',
        postedTimestamp: '2024-01-16T09:15:03Z',
        status: 'posted',
      },
    ];

    it('should successfully search transactions', async () => {
      const context: RequestContext = {
        traceId: 'test-trace',
        userId: 'user123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await requestContextStorage.run(context, async () => {
        return service.searchTransactions({
          accountId: '12345678901',
          pagination: { page: 1, pageSize: 50 },
        });
      });

      expect(mockAuditService.logSearchAttempt).toHaveBeenCalledWith('12345678901', 'user123');
      expect(mockAuthService.validateAccountAccess).toHaveBeenCalledWith('12345678901');
      expect(mockRepository.searchTransactions).toHaveBeenCalled();
      expect(mockAuditService.logSearchSuccess).toHaveBeenCalledWith(2, '12345678901', 'user123');
      expect(result.results).toHaveLength(2);
      expect(result.pagination.totalResults).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should paginate results correctly', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 1 },
      });

      expect(result.results).toHaveLength(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(1);
      expect(result.pagination.totalResults).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should return empty results for page beyond total', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        pagination: { page: 5, pageSize: 50 },
      });

      expect(result.results).toHaveLength(0);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should build applied filters list correctly', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
        amountRange: { min: 100, max: 500 },
        transactionTypes: ['01'],
        merchantName: 'AMAZON',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(result.searchMetadata.appliedFilters).toContain('dateRange');
      expect(result.searchMetadata.appliedFilters).toContain('amountRange');
      expect(result.searchMetadata.appliedFilters).toContain('transactionTypes');
      expect(result.searchMetadata.appliedFilters).toContain('merchantName');
      expect(result.searchMetadata.appliedFilters).toContain('accountId');
    });

    it('should track execution time', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(result.searchMetadata.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should apply default sort options', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(result.searchMetadata.sortedBy).toBe('date');
      expect(result.searchMetadata.sortOrder).toBe('desc');
    });

    it('should use custom sort options', async () => {
      mockRepository.searchTransactions.mockResolvedValue(mockTransactions);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        sortBy: 'amount',
        sortOrder: 'asc',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(result.searchMetadata.sortedBy).toBe('amount');
      expect(result.searchMetadata.sortOrder).toBe('asc');
    });

    it('should throw AppError for authorization failures', async () => {
      mockAuthService.validateAccountAccess.mockImplementation(() => {
        throw new AppError(403, 'FORBIDDEN', 'Access denied');
      });

      await expect(
        service.searchTransactions({
          accountId: '12345678901',
          pagination: { page: 1, pageSize: 50 },
        })
      ).rejects.toThrow(AppError);

      expect(mockAuditService.logSearchAttempt).toHaveBeenCalled();
      expect(mockRepository.searchTransactions).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const context: RequestContext = {
        traceId: 'error-trace',
        userId: 'user123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      mockRepository.searchTransactions.mockRejectedValue(new Error('Database error'));

      await requestContextStorage.run(context, async () => {
        await expect(
          service.searchTransactions({
            accountId: '12345678901',
            pagination: { page: 1, pageSize: 50 },
          })
        ).rejects.toThrow(AppError);
      });

      expect(mockAuditService.logSearchFailure).toHaveBeenCalledWith(
        'Database error',
        '12345678901',
        'user123'
      );
    });

    it('should validate card access when cardNumber provided', async () => {
      mockRepository.searchTransactions.mockResolvedValue([]);

      await service.searchTransactions({
        cardNumber: '1234567890123456',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(mockAuthService.validateCardAccess).toHaveBeenCalledWith('1234567890123456');
    });

    it('should handle empty results', async () => {
      mockRepository.searchTransactions.mockResolvedValue([]);

      const result = await service.searchTransactions({
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      });

      expect(result.results).toHaveLength(0);
      expect(result.pagination.totalResults).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(mockAuditService.logSearchSuccess).toHaveBeenCalledWith(0, '12345678901', undefined);
    });
  });
});
