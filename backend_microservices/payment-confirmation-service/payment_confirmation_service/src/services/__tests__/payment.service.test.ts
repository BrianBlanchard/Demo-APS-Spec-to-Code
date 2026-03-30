import { PaymentService } from '../payment.service';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { AuditService } from '../audit.service';
import { NotFoundError } from '../../middleware/error.middleware';
import { PaymentRecord } from '../../models/payment.model';

describe('Payment Service', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: jest.Mocked<IPaymentRepository>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockPaymentRepository = {
      findByConfirmationNumber: jest.fn(),
    };

    mockAuditService = {
      logEvent: jest.fn(),
    } as any;

    paymentService = new PaymentService(mockPaymentRepository, mockAuditService);
  });

  describe('getPaymentConfirmation', () => {
    it('should return payment confirmation when record exists', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 2450.75,
        payment_method: 'eft',
        previous_balance: 2450.75,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(mockPaymentRepository.findByConfirmationNumber).toHaveBeenCalledWith(
        confirmationNumber
      );
      expect(result).toEqual({
        paymentConfirmationNumber: confirmationNumber,
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 2450.75,
        paymentMethod: 'eft',
        previousBalance: 2450.75,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      });
    });

    it('should throw NotFoundError when record does not exist', async () => {
      const confirmationNumber = 'PAY-20240115-NOTFOUND';
      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(null);

      await expect(paymentService.getPaymentConfirmation(confirmationNumber)).rejects.toThrow(
        NotFoundError
      );
      await expect(paymentService.getPaymentConfirmation(confirmationNumber)).rejects.toThrow(
        'Payment confirmation not found'
      );
    });

    it('should log audit event on successful retrieval', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 2450.75,
        payment_method: 'eft',
        previous_balance: 2450.75,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: confirmationNumber,
        status: 'success',
        details: {
          accountId: '12345678901',
          paymentAmount: 2450.75,
          status: 'posted',
        },
      });
    });

    it('should log audit event on failure when not found', async () => {
      const confirmationNumber = 'PAY-20240115-NOTFOUND';
      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(null);

      try {
        await paymentService.getPaymentConfirmation(confirmationNumber);
      } catch (error) {
        // Expected error
      }

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: confirmationNumber,
        status: 'failure',
        details: { reason: 'not_found' },
      });
    });

    it('should map payment record fields correctly', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
        transaction_id: '9876543210987654',
        account_id: '98765432109',
        payment_amount: 1500.5,
        payment_method: 'credit_card',
        previous_balance: 1500.5,
        new_balance: 0.0,
        payment_date: '2024-01-16',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.paymentConfirmationNumber).toBe('PAY-20240115-ABC123');
      expect(result.transactionId).toBe('9876543210987654');
      expect(result.accountId).toBe('98765432109');
      expect(result.paymentAmount).toBe(1500.5);
      expect(result.paymentMethod).toBe('credit_card');
      expect(result.previousBalance).toBe(1500.5);
      expect(result.newBalance).toBe(0.0);
      expect(result.paymentDate).toBe('2024-01-16');
      expect(result.status).toBe('pending');
    });

    it('should handle EFT payment method', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'eft',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.paymentMethod).toBe('eft');
    });

    it('should handle credit card payment method', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'credit_card',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.paymentMethod).toBe('credit_card');
    });

    it('should handle debit card payment method', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'debit_card',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.paymentMethod).toBe('debit_card');
    });

    it('should handle posted status', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'eft',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.status).toBe('posted');
    });

    it('should handle pending status', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'eft',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.status).toBe('pending');
    });

    it('should handle failed status', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'eft',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'failed',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.status).toBe('failed');
    });

    it('should convert string amounts to numbers', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: any = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: '2450.75',
        payment_method: 'eft',
        previous_balance: '2450.75',
        new_balance: '0.00',
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(typeof result.paymentAmount).toBe('number');
      expect(typeof result.previousBalance).toBe('number');
      expect(typeof result.newBalance).toBe('number');
      expect(result.paymentAmount).toBe(2450.75);
      expect(result.previousBalance).toBe(2450.75);
      expect(result.newBalance).toBe(0.0);
    });

    it('should handle zero balance amounts', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: confirmationNumber,
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 0.0,
        payment_method: 'eft',
        previous_balance: 0.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPaymentRepository.findByConfirmationNumber.mockResolvedValue(mockRecord);

      const result = await paymentService.getPaymentConfirmation(confirmationNumber);

      expect(result.paymentAmount).toBe(0.0);
      expect(result.previousBalance).toBe(0.0);
      expect(result.newBalance).toBe(0.0);
    });
  });
});
