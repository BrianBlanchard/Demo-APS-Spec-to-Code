import { Request, Response, NextFunction } from 'express';
import { CustomerSearchController } from '../customer-search.controller';
import { ICustomerSearchService } from '../../services/customer-search.service';
import { SearchResponse, SearchResult } from '../../types/customer.types';
import { asyncLocalStorage } from '../../middleware/context.middleware';
import { RequestContext } from '../../types/context.types';
import { ZodError } from 'zod';

// Mock the context middleware module
jest.mock('../../middleware/context.middleware', () => ({
  asyncLocalStorage: {
    getStore: jest.fn(),
  },
  getContext: jest.fn(),
}));

describe('CustomerSearchController', () => {
  let controller: CustomerSearchController;
  let mockSearchService: jest.Mocked<ICustomerSearchService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  const mockSearchResult: SearchResult = {
    profile_id: 'cust-123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0100',
    loyalty_card: 'LC-12345',
    loyalty_tier: 'gold',
    last_activity: '2026-03-20T10:00:00Z',
    last_visit_store: 'store-001',
    match_score: 0.95,
    highlights: {
      name: '<em>John</em> Doe',
    },
  };

  const mockSearchResponse: SearchResponse = {
    total_results: 1,
    results: [mockSearchResult],
    query_time_ms: 45,
    pagination: {
      limit: 10,
      offset: 0,
      has_more: false,
    },
  };

  beforeEach(() => {
    // Create mock search service
    mockSearchService = {
      searchCustomers: jest.fn(),
    };

    // Create controller with mocked service
    controller = new CustomerSearchController(mockSearchService);

    // Setup mock request
    mockRequest = {
      query: {},
      headers: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('searchCustomers', () => {
    describe('successful searches', () => {
      it('should successfully search customers with valid query and user context', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        (asyncLocalStorage.getStore as jest.Mock).mockReturnValue(mockContext);
        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'John Doe',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          {
            query: 'John Doe',
            search_fields: undefined,
            filters: {
              loyalty_tier: undefined,
              store_id: undefined,
            },
            limit: 10,
            offset: 0,
          },
          'user-456'
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockSearchResponse);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle search with all optional parameters', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-789',
          userRole: 'manager',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'jane@example.com',
          search_fields: 'email,name',
          loyalty_tier: 'vip,gold',
          store_id: 'store-001',
          limit: '25',
          offset: '10',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          {
            query: 'jane@example.com',
            search_fields: ['email', 'name'],
            filters: {
              loyalty_tier: ['vip', 'gold'],
              store_id: 'store-001',
            },
            limit: 25,
            offset: 10,
          },
          'user-789'
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(mockSearchResponse);
      });

      it('should handle search with single search field', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-111',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: '+1-555-0100',
          search_fields: 'phone',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          {
            query: '+1-555-0100',
            search_fields: ['phone'],
            filters: {
              loyalty_tier: undefined,
              store_id: undefined,
            },
            limit: 10,
            offset: 0,
          },
          'user-111'
        );
      });

      it('should handle search with single loyalty tier', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-222',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'smith',
          loyalty_tier: 'silver',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          {
            query: 'smith',
            search_fields: undefined,
            filters: {
              loyalty_tier: ['silver'],
              store_id: undefined,
            },
            limit: 10,
            offset: 0,
          },
          'user-222'
        );
      });

      it('should handle minimum limit value', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-333',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          limit: '1',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 1,
          }),
          'user-333'
        );
      });

      it('should handle maximum limit value', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-444',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          limit: '50',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 50,
          }),
          'user-444'
        );
      });

      it('should handle offset value', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-555',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          offset: '100',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 100,
          }),
          'user-555'
        );
      });

      it('should handle all valid search fields', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-666',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          search_fields: 'name,email,phone,loyalty_card',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            search_fields: ['name', 'email', 'phone', 'loyalty_card'],
          }),
          'user-666'
        );
      });

      it('should handle all valid loyalty tiers', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-777',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          loyalty_tier: 'vip,gold,silver',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {
              loyalty_tier: ['vip', 'gold', 'silver'],
              store_id: undefined,
            },
          }),
          'user-777'
        );
      });
    });

    describe('authorization errors', () => {
      it('should throw UnauthorizedError when userId is missing from context', async () => {
        // Setup
        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(undefined);

        mockRequest.query = {
          query: 'John Doe',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'UNAUTHORIZED',
            message: 'User ID not found in request context',
            statusCode: 401,
          })
        );
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedError when context is present but userId is undefined', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: undefined,
          userRole: undefined,
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'John Doe',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'UNAUTHORIZED',
            message: 'User ID not found in request context',
            statusCode: 401,
          })
        );
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should throw UnauthorizedError when context is present but userId is empty string', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: '',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'John Doe',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'UNAUTHORIZED',
            message: 'User ID not found in request context',
            statusCode: 401,
          })
        );
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });
    });

    describe('validation errors', () => {
      it('should fail validation when query is missing', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {};

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when query is too short', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'a',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        const error = mockNext.mock.calls[0][0] as any;
        expect(error.errors[0].message).toBe('Query must be at least 2 characters');
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when search_fields contains invalid field', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          search_fields: 'name,invalid_field',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when loyalty_tier contains invalid tier', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          loyalty_tier: 'platinum',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when limit is less than 1', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          limit: '0',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when limit is greater than 50', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          limit: '51',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when limit is not a number', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          limit: 'abc',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when offset is negative', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          offset: '-1',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });

      it('should fail validation when offset is not a number', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
          offset: 'xyz',
        };

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
        expect(mockSearchService.searchCustomers).not.toHaveBeenCalled();
      });
    });

    describe('service errors', () => {
      it('should propagate service errors to next middleware', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
        };

        const serviceError = new Error('Database connection failed');
        mockSearchService.searchCustomers.mockRejectedValue(serviceError);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(serviceError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should propagate custom service errors to next middleware', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
        };

        const { ServiceUnavailableError } = require('../../types/error.types');
        const serviceError = new ServiceUnavailableError('Search service temporarily unavailable');
        mockSearchService.searchCustomers.mockRejectedValue(serviceError);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(serviceError);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should handle empty search results', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'nonexistent',
        };

        const emptyResponse: SearchResponse = {
          total_results: 0,
          results: [],
          query_time_ms: 10,
          pagination: {
            limit: 10,
            offset: 0,
            has_more: false,
          },
        };

        mockSearchService.searchCustomers.mockResolvedValue(emptyResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(emptyResponse);
      });

      it('should handle query with special characters', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: "O'Reilly & Sons",
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            query: "O'Reilly & Sons",
          }),
          'user-456'
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it('should handle query with unicode characters', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'Müller',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Müller',
          }),
          'user-456'
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it('should handle multiple results', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'smith',
        };

        const multipleResults: SearchResponse = {
          total_results: 3,
          results: [
            { ...mockSearchResult, profile_id: 'cust-001', last_name: 'Smith' },
            { ...mockSearchResult, profile_id: 'cust-002', last_name: 'Smithson' },
            { ...mockSearchResult, profile_id: 'cust-003', last_name: 'Blacksmith' },
          ],
          query_time_ms: 55,
          pagination: {
            limit: 10,
            offset: 0,
            has_more: false,
          },
        };

        mockSearchService.searchCustomers.mockResolvedValue(multipleResults);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(multipleResults);
      });

      it('should default to offset 0 when not provided', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 0,
          }),
          'user-456'
        );
      });

      it('should default to limit 10 when not provided', async () => {
        // Setup
        const mockContext: RequestContext = {
          traceId: 'trace-123',
          userId: 'user-456',
          userRole: 'associate',
          timestamp: new Date(),
        };

        const { getContext } = require('../../middleware/context.middleware');
        (getContext as jest.Mock).mockReturnValue(mockContext);

        mockRequest.query = {
          query: 'test',
        };

        mockSearchService.searchCustomers.mockResolvedValue(mockSearchResponse);

        // Execute
        await controller.searchCustomers(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Assert
        expect(mockSearchService.searchCustomers).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 10,
          }),
          'user-456'
        );
      });
    });
  });
});
