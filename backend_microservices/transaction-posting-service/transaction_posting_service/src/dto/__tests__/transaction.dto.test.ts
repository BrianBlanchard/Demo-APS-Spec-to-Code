import { PostTransactionRequestSchema } from '../transaction.dto';

describe('PostTransactionRequestSchema', () => {
  const validRequest = {
    validationId: 'VAL-20240115-ABC123',
    authorizationCode: 'AUTH789456',
    cardNumber: '4532123456781234',
    transactionType: '01',
    transactionCategory: '5411',
    amount: 125.50,
    merchantId: 'MERCH12345',
    merchantName: 'AMAZON.COM',
    merchantCity: 'Seattle',
    merchantZip: '98101',
    transactionSource: 'POS',
    transactionDescription: 'AMAZON.COM PURCHASE',
    originalTimestamp: '2024-01-15T14:30:00Z',
  };

  describe('Valid Request', () => {
    it('should validate a correct transaction request', () => {
      const result = PostTransactionRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept minimum positive amount', () => {
      const request = { ...validRequest, amount: 0.01 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should accept large amounts', () => {
      const request = { ...validRequest, amount: 99999.99 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should accept all valid transaction types', () => {
      const types = ['01', '02', '03', '04', '05', '06'];
      types.forEach((type) => {
        const request = { ...validRequest, transactionType: type };
        const result = PostTransactionRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation ID', () => {
    it('should reject empty validationId', () => {
      const request = { ...validRequest, validationId: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject validationId longer than 30 characters', () => {
      const request = { ...validRequest, validationId: 'A'.repeat(31) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept validationId exactly 30 characters', () => {
      const request = { ...validRequest, validationId: 'A'.repeat(30) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Authorization Code', () => {
    it('should reject empty authorizationCode', () => {
      const request = { ...validRequest, authorizationCode: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject authorizationCode longer than 20 characters', () => {
      const request = { ...validRequest, authorizationCode: 'A'.repeat(21) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept authorizationCode exactly 20 characters', () => {
      const request = { ...validRequest, authorizationCode: 'A'.repeat(20) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Card Number', () => {
    it('should reject card number with less than 16 digits', () => {
      const request = { ...validRequest, cardNumber: '123456789012345' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject card number with more than 16 digits', () => {
      const request = { ...validRequest, cardNumber: '12345678901234567' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject card number with non-numeric characters', () => {
      const request = { ...validRequest, cardNumber: '453212345678ABCD' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept valid 16-digit card number', () => {
      const request = { ...validRequest, cardNumber: '4532123456781234' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Transaction Type', () => {
    it('should reject invalid transaction type', () => {
      const request = { ...validRequest, transactionType: '07' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject transaction type with wrong format', () => {
      const request = { ...validRequest, transactionType: '1' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject transaction type starting with non-zero', () => {
      const request = { ...validRequest, transactionType: '11' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('Transaction Category', () => {
    it('should reject category with non-numeric characters', () => {
      const request = { ...validRequest, transactionCategory: 'ABCD' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject category shorter than 4 digits', () => {
      const request = { ...validRequest, transactionCategory: '541' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject category longer than 4 digits', () => {
      const request = { ...validRequest, transactionCategory: '54111' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept valid 4-digit category', () => {
      const request = { ...validRequest, transactionCategory: '5411' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Amount', () => {
    it('should reject zero amount', () => {
      const request = { ...validRequest, amount: 0 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const request = { ...validRequest, amount: -100 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject amount with more than 2 decimal places', () => {
      const request = { ...validRequest, amount: 125.505 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept amount with 1 decimal place', () => {
      const request = { ...validRequest, amount: 125.5 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should accept amount with 2 decimal places', () => {
      const request = { ...validRequest, amount: 125.50 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should accept whole number amount', () => {
      const request = { ...validRequest, amount: 125 };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Merchant Fields', () => {
    it('should reject empty merchantId', () => {
      const request = { ...validRequest, merchantId: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject merchantId longer than 10 characters', () => {
      const request = { ...validRequest, merchantId: 'A'.repeat(11) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject empty merchantName', () => {
      const request = { ...validRequest, merchantName: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject merchantName longer than 50 characters', () => {
      const request = { ...validRequest, merchantName: 'A'.repeat(51) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject empty merchantCity', () => {
      const request = { ...validRequest, merchantCity: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject merchantCity longer than 50 characters', () => {
      const request = { ...validRequest, merchantCity: 'A'.repeat(51) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject empty merchantZip', () => {
      const request = { ...validRequest, merchantZip: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject merchantZip longer than 10 characters', () => {
      const request = { ...validRequest, merchantZip: 'A'.repeat(11) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('Transaction Source and Description', () => {
    it('should reject empty transactionSource', () => {
      const request = { ...validRequest, transactionSource: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject transactionSource longer than 10 characters', () => {
      const request = { ...validRequest, transactionSource: 'A'.repeat(11) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject empty transactionDescription', () => {
      const request = { ...validRequest, transactionDescription: '' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject transactionDescription longer than 100 characters', () => {
      const request = { ...validRequest, transactionDescription: 'A'.repeat(101) };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('Original Timestamp', () => {
    it('should reject invalid datetime format', () => {
      const request = { ...validRequest, originalTimestamp: '2024-01-15 14:30:00' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date', () => {
      const request = { ...validRequest, originalTimestamp: '2024-13-01T14:30:00Z' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should accept valid ISO 8601 datetime', () => {
      const request = { ...validRequest, originalTimestamp: '2024-01-15T14:30:00Z' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with milliseconds', () => {
      const request = { ...validRequest, originalTimestamp: '2024-01-15T14:30:00.000Z' };
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject request missing validationId', () => {
      const { validationId, ...request } = validRequest;
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject request missing authorizationCode', () => {
      const { authorizationCode, ...request } = validRequest;
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject request missing cardNumber', () => {
      const { cardNumber, ...request } = validRequest;
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should reject request missing amount', () => {
      const { amount, ...request } = validRequest;
      const result = PostTransactionRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });
});
