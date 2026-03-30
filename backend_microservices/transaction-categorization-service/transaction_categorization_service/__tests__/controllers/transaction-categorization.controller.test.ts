import { Request, Response, NextFunction } from 'express';
import { TransactionCategorizationController } from '../../src/controllers/transaction-categorization.controller';
import type { ITransactionCategorizationService } from '../../src/services/transaction-categorization.service';
import type { CategorizeRequest } from '../../src/dto/categorize-request.dto';
import type { CategorizeResponse } from '../../src/dto/categorize-response.dto';

describe('TransactionCategorizationController', () => {
  let controller: TransactionCategorizationController;
  let mockService: ITransactionCategorizationService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock service
    mockService = {
      categorizeTransaction: jest.fn(),
    };

    // Create mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();

    controller = new TransactionCategorizationController(mockService);
  });

  describe('categorizeTransaction', () => {
    it('should successfully categorize a valid transaction', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle grocery store transaction', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'Grocery Store',
        amount: 125.5,
        description: 'Weekly groceries',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5411',
        categoryName: 'Grocery Stores and Supermarkets',
        categoryGroup: 'groceries',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 3.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle gas station transaction', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5541',
        merchantName: 'Gas Station',
        amount: 45.0,
        description: 'Fuel purchase',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5541',
        categoryName: 'Service Stations',
        categoryGroup: 'gas',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.5,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle unknown MCC with default category', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown Merchant',
        amount: 100.0,
        description: 'Unknown transaction',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '9999',
        categoryName: 'Other',
        categoryGroup: 'other',
        interestRate: 19.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle transaction with large amount', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Expensive Restaurant',
        amount: 999999.99,
        description: 'Large transaction',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should handle transaction with small amount', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Coffee Shop',
        amount: 0.01,
        description: 'Small transaction',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should handle merchant with maximum name length', async () => {
      const longName = 'A'.repeat(255);
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: longName,
        amount: 50.0,
        description: 'Transaction',
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should handle description with maximum length', async () => {
      const longDesc = 'D'.repeat(500);
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Restaurant',
        amount: 50.0,
        description: longDesc,
      };

      const expectedResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(expectedResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('Error handling', () => {
    it('should call next with error when service throws error', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const error = new Error('Service error');
      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockRejectedValue(error);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should call next with database error', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const error = new Error('Database connection failed');
      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockRejectedValue(error);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with custom error', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error occurred');
      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockRejectedValue(error);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect((mockNext as jest.Mock).mock.calls[0][0]).toBeInstanceOf(CustomError);
    });

    it('should not call response methods when error occurs', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const error = new Error('Service error');
      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockRejectedValue(error);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });

  describe('Service interaction', () => {
    it('should pass request body to service', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue({});

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledTimes(1);
      expect(mockService.categorizeTransaction).toHaveBeenCalledWith(requestBody);
    });

    it('should call service exactly once per request', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue({});

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.categorizeTransaction).toHaveBeenCalledTimes(1);
    });

    it('should return exact response from service', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      const serviceResponse: CategorizeResponse = {
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue(serviceResponse);

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(serviceResponse);
    });
  });

  describe('Response status codes', () => {
    it('should return 200 for successful categorization', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'Test Restaurant',
        amount: 50.0,
        description: 'Lunch payment',
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue({});

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should always return 200 for successful service calls', async () => {
      const requestBody: CategorizeRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'Unknown',
        amount: 1.0,
        description: 'Test',
      };

      mockRequest.body = requestBody;
      (mockService.categorizeTransaction as jest.Mock).mockResolvedValue({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '9999',
        categoryName: 'Other',
        categoryGroup: 'other',
        interestRate: 19.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      });

      await controller.categorizeTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });
});
