import { ValidateTransactionRequestSchema } from '../../../src/dtos/validate-transaction.dto';
import { TransactionType, TransactionSource } from '../../../src/models/transaction.model';

describe('ValidateTransactionRequestSchema', () => {
  const validRequest = {
    cardNumber: '4532123456781234',
    transactionType: TransactionType.PURCHASE,
    transactionCategory: '5411',
    amount: 125.50,
    merchantId: 'MERCH12345',
    merchantName: 'AMAZON.COM',
    merchantCity: 'Seattle',
    merchantZip: '98101',
    transactionTimestamp: '2024-01-15T14:30:00Z',
    transactionSource: TransactionSource.POS,
  };

  describe('Valid Requests', () => {
    it('should validate a complete valid request', () => {
      const result = ValidateTransactionRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate request with optional CVV', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cvv: '123',
      });
      expect(result.success).toBe(true);
    });

    it('should validate all transaction types', () => {
      const types: TransactionType[] = [
        TransactionType.PURCHASE,
        TransactionType.PAYMENT,
        TransactionType.CASH_ADVANCE,
        TransactionType.FEE,
        TransactionType.INTEREST,
        TransactionType.ADJUSTMENT,
      ];

      types.forEach((type) => {
        const result = ValidateTransactionRequestSchema.safeParse({
          ...validRequest,
          transactionType: type,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate all transaction sources', () => {
      const sources: TransactionSource[] = [
        TransactionSource.POS,
        TransactionSource.ONLINE,
        TransactionSource.ATM,
      ];

      sources.forEach((source) => {
        const result = ValidateTransactionRequestSchema.safeParse({
          ...validRequest,
          transactionSource: source,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate minimum amount', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: 0.01,
      });
      expect(result.success).toBe(true);
    });

    it('should validate large amount with 2 decimal places', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: 999999999999.99,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid Card Number', () => {
    it('should reject card number with less than 16 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cardNumber: '453212345678123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('16 digits');
      }
    });

    it('should reject card number with more than 16 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cardNumber: '45321234567812345',
      });
      expect(result.success).toBe(false);
    });

    it('should reject card number with non-numeric characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cardNumber: '453212345678123A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('only digits');
      }
    });

    it('should reject empty card number', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cardNumber: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Transaction Type', () => {
    it('should reject invalid transaction type', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionType: '99',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid transaction type');
      }
    });
  });

  describe('Invalid Transaction Category', () => {
    it('should reject category with less than 4 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionCategory: '541',
      });
      expect(result.success).toBe(false);
    });

    it('should reject category with more than 4 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionCategory: '54111',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric category', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionCategory: 'ABCD',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Amount', () => {
    it('should reject zero amount', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive');
      }
    });

    it('should reject negative amount', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: -125.50,
      });
      expect(result.success).toBe(false);
    });

    it('should reject amount with more than 2 decimal places', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: 125.505,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('2 decimal places');
      }
    });

    it('should reject amount exceeding maximum', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        amount: 10000000000000000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Merchant Fields', () => {
    it('should reject empty merchant ID', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantId: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject merchant ID exceeding 10 characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantId: 'MERCH123456',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty merchant name', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject merchant name exceeding 50 characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantName: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty merchant city', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantCity: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject merchant city exceeding 50 characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantCity: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty merchant ZIP', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantZip: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject merchant ZIP exceeding 10 characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        merchantZip: '12345678901',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Timestamp', () => {
    it('should reject invalid ISO 8601 format', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionTimestamp: '2024-01-15 14:30:00',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('ISO 8601');
      }
    });

    it('should reject empty timestamp', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionTimestamp: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid Transaction Source', () => {
    it('should reject invalid source', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        transactionSource: 'INVALID',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid transaction source');
      }
    });
  });

  describe('Invalid CVV', () => {
    it('should reject CVV with less than 3 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cvv: '12',
      });
      expect(result.success).toBe(false);
    });

    it('should reject CVV with more than 3 digits', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cvv: '1234',
      });
      expect(result.success).toBe(false);
    });

    it('should reject CVV with non-numeric characters', () => {
      const result = ValidateTransactionRequestSchema.safeParse({
        ...validRequest,
        cvv: '12A',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject request without cardNumber', () => {
      const { cardNumber, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject request without transactionType', () => {
      const { transactionType, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject request without amount', () => {
      const { amount, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject request without merchantId', () => {
      const { merchantId, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject request without transactionTimestamp', () => {
      const { transactionTimestamp, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject request without transactionSource', () => {
      const { transactionSource, ...incomplete } = validRequest;
      const result = ValidateTransactionRequestSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });
});
