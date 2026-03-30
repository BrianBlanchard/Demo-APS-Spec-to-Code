import { Request, Response, NextFunction } from 'express';
import { TransactionSearchController } from '../transaction-search.controller';
import { ITransactionSearchService } from '../../services/transaction-search.service';
import { TransactionSearchResponse } from '../../types';

describe('TransactionSearchController - Controller/API Layer', () => {
  let controller: TransactionSearchController;
  let mockService: jest.Mocked<ITransactionSearchService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockService = {
      searchTransactions: jest.fn(),
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();

    controller = new TransactionSearchController(mockService);
  });

  describe('search', () => {
    it('should return search results with status 200', async () => {
      const mockResult: TransactionSearchResponse = {
        results: [
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
        ],
        pagination: {
          currentPage: 1,
          pageSize: 50,
          totalResults: 1,
          totalPages: 1,
        },
        searchMetadata: {
          executionTimeMs: 85,
          appliedFilters: ['accountId'],
          sortedBy: 'date',
          sortOrder: 'desc',
        },
      };

      mockService.searchTransactions.mockResolvedValue(mockResult);

      mockRequest.body = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };

      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.searchTransactions).toHaveBeenCalledWith(mockRequest.body);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      mockService.searchTransactions.mockRejectedValue(error);

      mockRequest.body = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };

      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      const mockResult: TransactionSearchResponse = {
        results: [],
        pagination: {
          currentPage: 1,
          pageSize: 50,
          totalResults: 0,
          totalPages: 0,
        },
        searchMetadata: {
          executionTimeMs: 10,
          appliedFilters: ['accountId'],
          sortedBy: 'date',
          sortOrder: 'desc',
        },
      };

      mockService.searchTransactions.mockResolvedValue(mockResult);

      mockRequest.body = {
        accountId: '99999999999',
        pagination: { page: 1, pageSize: 50 },
      };

      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should handle requests with all filter options', async () => {
      const mockResult: TransactionSearchResponse = {
        results: [],
        pagination: {
          currentPage: 1,
          pageSize: 25,
          totalResults: 0,
          totalPages: 0,
        },
        searchMetadata: {
          executionTimeMs: 50,
          appliedFilters: ['accountId', 'dateRange', 'amountRange', 'merchantName'],
          sortedBy: 'amount',
          sortOrder: 'asc',
        },
      };

      mockService.searchTransactions.mockResolvedValue(mockResult);

      mockRequest.body = {
        accountId: '12345678901',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        amountRange: {
          min: 100.0,
          max: 500.0,
        },
        merchantName: 'AMAZON',
        sortBy: 'amount',
        sortOrder: 'asc',
        pagination: { page: 1, pageSize: 25 },
      };

      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockService.searchTransactions).toHaveBeenCalledWith(mockRequest.body);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });
});
