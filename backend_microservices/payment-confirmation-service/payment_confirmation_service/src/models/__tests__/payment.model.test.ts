import { PaymentRecord } from '../payment.model';

describe('Payment Model', () => {
  describe('PaymentRecord interface', () => {
    it('should accept a valid payment record with all required fields', () => {
      const record: PaymentRecord = {
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
        created_at: new Date('2024-01-15T10:00:00Z'),
        updated_at: new Date('2024-01-15T10:00:00Z'),
      };

      expect(record.id).toBe(1);
      expect(record.payment_confirmation_number).toBe('PAY-20240115-ABC123');
      expect(record.transaction_id).toBe('1234567890123456');
      expect(record.account_id).toBe('12345678901');
      expect(record.payment_amount).toBe(2450.75);
      expect(record.payment_method).toBe('eft');
      expect(record.previous_balance).toBe(2450.75);
      expect(record.new_balance).toBe(0.0);
      expect(record.payment_date).toBe('2024-01-15');
      expect(record.status).toBe('posted');
      expect(record.created_at).toBeInstanceOf(Date);
      expect(record.updated_at).toBeInstanceOf(Date);
    });

    it('should support all payment methods', () => {
      const eftRecord: PaymentRecord = {
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

      const creditCardRecord: PaymentRecord = {
        ...eftRecord,
        id: 2,
        payment_method: 'credit_card',
      };

      const debitCardRecord: PaymentRecord = {
        ...eftRecord,
        id: 3,
        payment_method: 'debit_card',
      };

      expect(eftRecord.payment_method).toBe('eft');
      expect(creditCardRecord.payment_method).toBe('credit_card');
      expect(debitCardRecord.payment_method).toBe('debit_card');
    });

    it('should support all payment statuses', () => {
      const postedRecord: PaymentRecord = {
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

      const pendingRecord: PaymentRecord = { ...postedRecord, id: 2, status: 'pending' };
      const failedRecord: PaymentRecord = { ...postedRecord, id: 3, status: 'failed' };

      expect(postedRecord.status).toBe('posted');
      expect(pendingRecord.status).toBe('pending');
      expect(failedRecord.status).toBe('failed');
    });

    it('should handle decimal amounts correctly', () => {
      const record: PaymentRecord = {
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

      expect(record.payment_amount).toBe(2450.75);
      expect(record.previous_balance).toBe(2450.75);
      expect(record.new_balance).toBe(0.0);
    });

    it('should handle zero balance scenarios', () => {
      const record: PaymentRecord = {
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

      expect(record.payment_amount).toBe(0.0);
      expect(record.previous_balance).toBe(0.0);
      expect(record.new_balance).toBe(0.0);
    });

    it('should handle large payment amounts', () => {
      const record: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 999999.99,
        payment_method: 'eft',
        previous_balance: 999999.99,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(record.payment_amount).toBe(999999.99);
    });

    it('should maintain timestamp consistency', () => {
      const now = new Date();
      const record: PaymentRecord = {
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
        created_at: now,
        updated_at: now,
      };

      expect(record.created_at.getTime()).toBe(now.getTime());
      expect(record.updated_at.getTime()).toBe(now.getTime());
    });
  });
});
