import {
  DateRangeSchema,
  AmountRangeSchema,
  PaginationSchema,
  TransactionSearchRequestSchema,
} from '../validation.schemas';

describe('ValidationSchemas - DTOs/Data Types', () => {
  describe('DateRangeSchema', () => {
    it('should validate correct date range', () => {
      const validData = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const result = DateRangeSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        startDate: '01-01-2024',
        endDate: '2024-01-31',
      };
      expect(() => DateRangeSchema.parse(invalidData)).toThrow();
    });

    it('should reject when startDate is after endDate', () => {
      const invalidData = {
        startDate: '2024-01-31',
        endDate: '2024-01-01',
      };
      expect(() => DateRangeSchema.parse(invalidData)).toThrow();
    });

    it('should accept when startDate equals endDate', () => {
      const validData = {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      };
      const result = DateRangeSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('AmountRangeSchema', () => {
    it('should validate correct amount range', () => {
      const validData = {
        min: 100.0,
        max: 500.0,
      };
      const result = AmountRangeSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject negative minimum', () => {
      const invalidData = {
        min: -10.0,
        max: 500.0,
      };
      expect(() => AmountRangeSchema.parse(invalidData)).toThrow();
    });

    it('should reject when min is greater than max', () => {
      const invalidData = {
        min: 500.0,
        max: 100.0,
      };
      expect(() => AmountRangeSchema.parse(invalidData)).toThrow();
    });

    it('should accept when min equals max', () => {
      const validData = {
        min: 100.0,
        max: 100.0,
      };
      const result = AmountRangeSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept zero values', () => {
      const validData = {
        min: 0,
        max: 0,
      };
      const result = AmountRangeSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('PaginationSchema', () => {
    it('should validate correct pagination', () => {
      const validData = {
        page: 1,
        pageSize: 50,
      };
      const result = PaginationSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject page less than 1', () => {
      const invalidData = {
        page: 0,
        pageSize: 50,
      };
      expect(() => PaginationSchema.parse(invalidData)).toThrow();
    });

    it('should reject pageSize less than 1', () => {
      const invalidData = {
        page: 1,
        pageSize: 0,
      };
      expect(() => PaginationSchema.parse(invalidData)).toThrow();
    });

    it('should reject pageSize greater than 100', () => {
      const invalidData = {
        page: 1,
        pageSize: 101,
      };
      expect(() => PaginationSchema.parse(invalidData)).toThrow();
    });

    it('should accept maximum pageSize of 100', () => {
      const validData = {
        page: 1,
        pageSize: 100,
      };
      const result = PaginationSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject non-integer page', () => {
      const invalidData = {
        page: 1.5,
        pageSize: 50,
      };
      expect(() => PaginationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('TransactionSearchRequestSchema', () => {
    it('should validate request with accountId', () => {
      const validData = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };
      const result = TransactionSearchRequestSchema.parse(validData);
      expect(result.accountId).toBe('12345678901');
    });

    it('should validate request with cardNumber', () => {
      const validData = {
        cardNumber: '1234567890123456',
        pagination: { page: 1, pageSize: 50 },
      };
      const result = TransactionSearchRequestSchema.parse(validData);
      expect(result.cardNumber).toBe('1234567890123456');
    });

    it('should validate request with dateRange', () => {
      const validData = {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        pagination: { page: 1, pageSize: 50 },
      };
      const result = TransactionSearchRequestSchema.parse(validData);
      expect(result.dateRange).toBeDefined();
    });

    it('should reject request with no search criteria', () => {
      const invalidData = {
        pagination: { page: 1, pageSize: 50 },
      };
      expect(() => TransactionSearchRequestSchema.parse(invalidData)).toThrow();
    });

    it('should reject accountId with wrong length', () => {
      const invalidData = {
        accountId: '123456',
        pagination: { page: 1, pageSize: 50 },
      };
      expect(() => TransactionSearchRequestSchema.parse(invalidData)).toThrow();
    });

    it('should reject cardNumber with wrong length', () => {
      const invalidData = {
        cardNumber: '12345678',
        pagination: { page: 1, pageSize: 50 },
      };
      expect(() => TransactionSearchRequestSchema.parse(invalidData)).toThrow();
    });

    it('should apply default sortBy and sortOrder', () => {
      const validData = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };
      const result = TransactionSearchRequestSchema.parse(validData);
      expect(result.sortBy).toBe('date');
      expect(result.sortOrder).toBe('desc');
    });

    it('should validate complete request with all optional fields', () => {
      const validData = {
        accountId: '12345678901',
        cardNumber: '1234567890123456',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        amountRange: {
          min: 100.0,
          max: 500.0,
        },
        transactionTypes: ['01', '02'],
        merchantName: 'AMAZON',
        sortBy: 'amount' as const,
        sortOrder: 'asc' as const,
        pagination: { page: 2, pageSize: 25 },
      };
      const result = TransactionSearchRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid sortBy value', () => {
      const invalidData = {
        accountId: '12345678901',
        sortBy: 'invalid',
        pagination: { page: 1, pageSize: 50 },
      };
      expect(() => TransactionSearchRequestSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid sortOrder value', () => {
      const invalidData = {
        accountId: '12345678901',
        sortOrder: 'invalid',
        pagination: { page: 1, pageSize: 50 },
      };
      expect(() => TransactionSearchRequestSchema.parse(invalidData)).toThrow();
    });
  });
});
