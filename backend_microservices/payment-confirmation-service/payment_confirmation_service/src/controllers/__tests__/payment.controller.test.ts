import { Request, Response, NextFunction } from 'express';
import { PaymentController } from '../payment.controller';
import { PaymentService } from '../../services/payment.service';
import { NotFoundError, ValidationError } from '../../middleware/error.middleware';
import { PaymentConfirmation } from '../../types/payment.types';

describe('Payment Controller', () => {
  let paymentController: PaymentController;
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockPaymentService = {
      getPaymentConfirmation: jest.fn(),
    } as any;

    paymentController = new PaymentController(mockPaymentService);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe('getPaymentConfirmation', () => {
    it('should return payment confirmation when found', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockConfirmation: PaymentConfirmation = {
        paymentConfirmationNumber: confirmationNumber,
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 2450.75,
        paymentMethod: 'eft',
        previousBalance: 2450.75,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      mockRequest.params = { confirmationNumber };
      mockPaymentService.getPaymentConfirmation.mockResolvedValue(mockConfirmation);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).toHaveBeenCalledWith(confirmationNumber);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockConfirmation);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate confirmation number format', async () => {
      const invalidConfirmationNumber = 'INVALID-FORMAT';
      mockRequest.params = { confirmationNumber: invalidConfirmationNumber };

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid confirmation number format',
        })
      );
    });

    it('should reject confirmation number without PAY prefix', async () => {
      const invalidConfirmationNumber = '20240115-ABC123';
      mockRequest.params = { confirmationNumber: invalidConfirmationNumber };

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should reject confirmation number with invalid date format', async () => {
      const invalidConfirmationNumber = 'PAY-ABCD1234-ABC123';
      mockRequest.params = { confirmationNumber: invalidConfirmationNumber };

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should accept valid confirmation number with alphanumeric suffix', async () => {
      const validConfirmationNumber = 'PAY-20240115-ABC123';
      const mockConfirmation: PaymentConfirmation = {
        paymentConfirmationNumber: validConfirmationNumber,
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 100.0,
        paymentMethod: 'credit_card',
        previousBalance: 100.0,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      mockRequest.params = { confirmationNumber: validConfirmationNumber };
      mockPaymentService.getPaymentConfirmation.mockResolvedValue(mockConfirmation);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).toHaveBeenCalledWith(
        validConfirmationNumber
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should pass NotFoundError to next middleware when payment not found', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      mockRequest.params = { confirmationNumber };

      const notFoundError = new NotFoundError('Payment confirmation not found');
      mockPaymentService.getPaymentConfirmation.mockRejectedValue(notFoundError);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should pass generic errors to next middleware', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      mockRequest.params = { confirmationNumber };

      const genericError = new Error('Database connection failed');
      mockPaymentService.getPaymentConfirmation.mockRejectedValue(genericError);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(genericError);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle empty confirmation number', async () => {
      mockRequest.params = { confirmationNumber: '' };

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should handle missing params object', async () => {
      mockRequest.params = undefined;

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPaymentService.getPaymentConfirmation).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return different payment methods correctly', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';

      // Test EFT payment
      const eftPayment: PaymentConfirmation = {
        paymentConfirmationNumber: confirmationNumber,
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 100.0,
        paymentMethod: 'eft',
        previousBalance: 100.0,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      mockRequest.params = { confirmationNumber };
      mockPaymentService.getPaymentConfirmation.mockResolvedValue(eftPayment);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'eft',
        })
      );
    });

    it('should return different payment statuses correctly', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';

      const pendingPayment: PaymentConfirmation = {
        paymentConfirmationNumber: confirmationNumber,
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 100.0,
        paymentMethod: 'eft',
        previousBalance: 100.0,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'pending',
      };

      mockRequest.params = { confirmationNumber };
      mockPaymentService.getPaymentConfirmation.mockResolvedValue(pendingPayment);

      await paymentController.getPaymentConfirmation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        })
      );
    });
  });
});
