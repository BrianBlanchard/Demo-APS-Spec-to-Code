import { Transaction } from '../transaction.entity';
import { TRANSACTION_TYPE_FEE } from '../../types/fee-types';

describe('Transaction Entity', () => {
  describe('Type Structure', () => {
    it('should allow valid transaction object', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: TRANSACTION_TYPE_FEE,
        amount: 35.0,
        description: 'Late payment fee - Payment past due date',
        status: 'posted',
        createdAt: new Date('2024-01-15T00:00:00.000Z'),
      };

      expect(transaction.transactionId).toBe('1234567890123456');
      expect(transaction.accountId).toBe('12345678901');
      expect(transaction.transactionType).toBe('04');
      expect(transaction.amount).toBe(35.0);
      expect(transaction.description).toBe('Late payment fee - Payment past due date');
      expect(transaction.status).toBe('posted');
      expect(transaction.createdAt).toBeInstanceOf(Date);
    });

    it('should allow fee transaction with type 04', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee transaction',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(transaction.transactionType).toBe('04');
    });

    it('should allow different transaction types', () => {
      const types = ['01', '02', '03', '04', '05'];

      types.forEach((type) => {
        const transaction: Transaction = {
          transactionId: '1234567890123456',
          accountId: '12345678901',
          transactionType: type,
          amount: 100.0,
          description: 'Test transaction',
          status: 'posted',
          createdAt: new Date(),
        };

        expect(transaction.transactionType).toBe(type);
      });
    });

    it('should allow different status values', () => {
      const statuses = ['posted', 'pending', 'reversed', 'failed'];

      statuses.forEach((status) => {
        const transaction: Transaction = {
          transactionId: '1234567890123456',
          accountId: '12345678901',
          transactionType: '04',
          amount: 35.0,
          description: 'Test',
          status,
          createdAt: new Date(),
        };

        expect(transaction.status).toBe(status);
      });
    });

    it('should allow positive amounts', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(transaction.amount).toBe(35.0);
      expect(transaction.amount).toBeGreaterThan(0);
    });

    it('should allow amounts with decimal places', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.99,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(transaction.amount).toBe(35.99);
    });

    it('should preserve Date object for createdAt', () => {
      const now = new Date();
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: now,
      };

      expect(transaction.createdAt).toBe(now);
      expect(transaction.createdAt).toBeInstanceOf(Date);
    });

    it('should allow long descriptions', () => {
      const longDescription =
        'This is a very long fee description that contains multiple words and explains the reason for the fee assessment in great detail';

      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: longDescription,
        status: 'posted',
        createdAt: new Date(),
      };

      expect(transaction.description).toBe(longDescription);
      expect(transaction.description.length).toBeGreaterThan(50);
    });
  });

  describe('Field Types', () => {
    it('should have transactionId as string', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.transactionId).toBe('string');
    });

    it('should have accountId as string', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.accountId).toBe('string');
    });

    it('should have transactionType as string', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.transactionType).toBe('string');
    });

    it('should have amount as number', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.amount).toBe('number');
    });

    it('should have description as string', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.description).toBe('string');
    });

    it('should have status as string', () => {
      const transaction: Transaction = {
        transactionId: '1234567890123456',
        accountId: '12345678901',
        transactionType: '04',
        amount: 35.0,
        description: 'Fee',
        status: 'posted',
        createdAt: new Date(),
      };

      expect(typeof transaction.status).toBe('string');
    });
  });
});
