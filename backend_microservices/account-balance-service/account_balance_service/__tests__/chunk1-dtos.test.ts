import { AccountIdParamSchema, BalanceUpdateRequestSchema } from '../src/types/dto';
import { TransactionType } from '../src/types/account.types';

describe('Chunk 1: DTOs / Data Types', () => {
  describe('AccountIdParamSchema', () => {
    it('should validate correct account ID with 11 digits', () => {
      const validData = { accountId: '12345678901' };
      const result = AccountIdParamSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accountId).toBe('12345678901');
      }
    });

    it('should reject account ID with less than 11 digits', () => {
      const invalidData = { accountId: '1234567890' };
      const result = AccountIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('11 digits');
      }
    });

    it('should reject account ID with more than 11 digits', () => {
      const invalidData = { accountId: '123456789012' };
      const result = AccountIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject non-string account ID', () => {
      const invalidData = { accountId: 12345678901 };
      const result = AccountIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing account ID', () => {
      const invalidData = {};
      const result = AccountIdParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('BalanceUpdateRequestSchema', () => {
    it('should validate correct balance update request', () => {
      const validData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: 125.50,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transactionId).toBe('1234567890123456');
        expect(result.data.amount).toBe(125.50);
        expect(result.data.isDebit).toBe(true);
      }
    });

    it('should validate all transaction types', () => {
      const types = [
        TransactionType.PURCHASE,
        TransactionType.PAYMENT,
        TransactionType.CASH_ADVANCE,
        TransactionType.REFUND,
        TransactionType.FEE,
        TransactionType.INTEREST,
      ];

      types.forEach((type) => {
        const validData = {
          transactionId: '1234567890123456',
          transactionType: type,
          amount: 100.0,
          isDebit: true,
          timestamp: '2024-01-15T14:30:00Z',
        };
        const result = BalanceUpdateRequestSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject transaction ID with wrong length', () => {
      const invalidData = {
        transactionId: '123456789012345',
        transactionType: TransactionType.PURCHASE,
        amount: 125.50,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('16 characters');
      }
    });

    it('should reject negative amount', () => {
      const invalidData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: -125.50,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject zero amount', () => {
      const invalidData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: 0,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid transaction type', () => {
      const invalidData = {
        transactionId: '1234567890123456',
        transactionType: 'invalid_type',
        amount: 125.50,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean isDebit', () => {
      const invalidData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: 125.50,
        isDebit: 'true',
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid timestamp format', () => {
      const invalidData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: 125.50,
        isDebit: true,
        timestamp: '2024-01-15 14:30:00',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        transactionId: '1234567890123456',
      };
      const result = BalanceUpdateRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate credit transaction with isDebit false', () => {
      const validData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PAYMENT,
        amount: 500.00,
        isDebit: false,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDebit).toBe(false);
      }
    });

    it('should validate decimal amounts', () => {
      const validData = {
        transactionId: '1234567890123456',
        transactionType: TransactionType.PURCHASE,
        amount: 99.99,
        isDebit: true,
        timestamp: '2024-01-15T14:30:00Z',
      };
      const result = BalanceUpdateRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(99.99);
      }
    });
  });

  describe('TransactionType Enum', () => {
    it('should have all required transaction types', () => {
      expect(TransactionType.PURCHASE).toBe('purchase');
      expect(TransactionType.PAYMENT).toBe('payment');
      expect(TransactionType.CASH_ADVANCE).toBe('cash_advance');
      expect(TransactionType.REFUND).toBe('refund');
      expect(TransactionType.FEE).toBe('fee');
      expect(TransactionType.INTEREST).toBe('interest');
    });

    it('should have exactly 6 transaction types', () => {
      const types = Object.values(TransactionType);
      expect(types.length).toBe(6);
    });
  });
});
