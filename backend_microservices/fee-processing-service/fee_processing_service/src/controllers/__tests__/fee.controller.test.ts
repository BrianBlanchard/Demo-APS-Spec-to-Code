import { Request, Response, NextFunction } from 'express';
import { FeeController } from '../fee.controller';
import { IFeeService } from '../../services/fee.service';
import { FeeType } from '../../types/fee-types';

describe('FeeController', () => {
  let feeController: FeeController;
  let mockFeeService: jest.Mocked<IFeeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockFeeService = {
      assessFee: jest.fn(),
    };

    feeController = new FeeController(mockFeeService);

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('assessFee', () => {
    it('should return 200 with result on successful fee assessment', async () => {
      const requestBody = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Payment past due date',
      };

      const serviceResult = {
        accountId: '12345678901',
        feeType: 'late_payment',
        amount: 35.0,
        transactionId: '1234567890123456',
        posted: true,
      };

      mockRequest.body = requestBody;
      mockFeeService.assessFee.mockResolvedValue(serviceResult);

      await feeController.assessFee(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on validation failure', async () => {
      const invalidBody = {
        accountId: '123', // Invalid: too short
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      mockRequest.body = invalidBody;

      await feeController.assessFee(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      const requestBody = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      const serviceError = new Error('Service error');

      mockRequest.body = requestBody;
      mockFeeService.assessFee.mockRejectedValue(serviceError);

      await feeController.assessFee(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should validate request body schema', async () => {
      const invalidBodies = [
        { accountId: '12345678901', amount: 35.0, reason: 'Test' }, // Missing feeType
        { feeType: FeeType.LATE_PAYMENT, amount: 35.0, reason: 'Test' }, // Missing accountId
        { accountId: '12345678901', feeType: FeeType.LATE_PAYMENT, reason: 'Test' }, // Missing amount
        { accountId: '12345678901', feeType: FeeType.LATE_PAYMENT, amount: 35.0 }, // Missing reason
      ];

      for (const body of invalidBodies) {
        mockRequest.body = body;
        (mockNext as jest.Mock).mockClear();

        await feeController.assessFee(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      }
    });
  });
});
