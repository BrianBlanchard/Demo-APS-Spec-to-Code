import { Knex } from 'knex';
import { PaymentRepository } from '../payment.repository';
import { PaymentRecord } from '../../models/payment.model';

describe('Payment Repository', () => {
  let paymentRepository: PaymentRepository;
  let mockDb: jest.Mocked<Knex>;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
    };

    mockDb = jest.fn(() => mockQueryBuilder) as any;
    mockDb.raw = jest.fn();

    paymentRepository = new PaymentRepository(mockDb);
  });

  describe('findByConfirmationNumber', () => {
    it('should return payment record when found', async () => {
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
        created_at: new Date('2024-01-15T10:00:00Z'),
        updated_at: new Date('2024-01-15T10:00:00Z'),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber(confirmationNumber);

      expect(mockDb).toHaveBeenCalledWith('payments');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment_confirmation_number',
        confirmationNumber
      );
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toEqual(mockRecord);
    });

    it('should return null when record not found', async () => {
      const confirmationNumber = 'PAY-20240115-NOTFOUND';
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await paymentRepository.findByConfirmationNumber(confirmationNumber);

      expect(mockDb).toHaveBeenCalledWith('payments');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment_confirmation_number',
        confirmationNumber
      );
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should query the correct table', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(mockDb).toHaveBeenCalledWith('payments');
    });

    it('should filter by confirmation number', async () => {
      const confirmationNumber = 'PAY-20240115-XYZ789';
      mockQueryBuilder.first.mockResolvedValue(undefined);

      await paymentRepository.findByConfirmationNumber(confirmationNumber);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment_confirmation_number',
        confirmationNumber
      );
    });

    it('should return first matching record', async () => {
      mockQueryBuilder.first.mockResolvedValue({ id: 1 });

      await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });

    it('should handle EFT payment records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.payment_method).toBe('eft');
    });

    it('should handle credit card payment records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.payment_method).toBe('credit_card');
    });

    it('should handle debit card payment records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.payment_method).toBe('debit_card');
    });

    it('should handle posted status records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.status).toBe('posted');
    });

    it('should handle pending status records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.status).toBe('pending');
    });

    it('should handle failed status records', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.status).toBe('failed');
    });

    it('should handle decimal payment amounts', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.payment_amount).toBe(2450.75);
      expect(result?.previous_balance).toBe(2450.75);
      expect(result?.new_balance).toBe(0.0);
    });

    it('should handle zero balance amounts', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
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

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.payment_amount).toBe(0.0);
      expect(result?.previous_balance).toBe(0.0);
      expect(result?.new_balance).toBe(0.0);
    });

    it('should handle database errors', async () => {
      const confirmationNumber = 'PAY-20240115-ABC123';
      const dbError = new Error('Database connection failed');

      mockQueryBuilder.first.mockRejectedValue(dbError);

      await expect(
        paymentRepository.findByConfirmationNumber(confirmationNumber)
      ).rejects.toThrow('Database connection failed');
    });

    it('should preserve timestamps from database', async () => {
      const createdAt = new Date('2024-01-15T10:00:00Z');
      const updatedAt = new Date('2024-01-15T10:30:00Z');

      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 100.0,
        payment_method: 'eft',
        previous_balance: 100.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: createdAt,
        updated_at: updatedAt,
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const result = await paymentRepository.findByConfirmationNumber('PAY-20240115-ABC123');

      expect(result?.created_at).toEqual(createdAt);
      expect(result?.updated_at).toEqual(updatedAt);
    });
  });
});
