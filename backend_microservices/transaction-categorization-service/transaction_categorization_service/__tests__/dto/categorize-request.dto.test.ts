import { CategorizeRequestSchema } from '../../src/dto/categorize-request.dto';
import { ZodError } from 'zod';

describe('CategorizeRequestSchema', () => {
  describe('Valid requests', () => {
    it('should validate a valid request with all required fields', () => {
      const validRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'WHOLE FOODS',
        amount: 125.5,
        description: 'WHOLE FOODS PURCHASE',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should validate request with minimum valid values', () => {
      const validRequest = {
        merchantCategoryCode: '0000',
        merchantName: 'A',
        amount: 0.01,
        description: 'X',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should validate request with maximum length values', () => {
      const validRequest = {
        merchantCategoryCode: '9999',
        merchantName: 'A'.repeat(255),
        amount: 999999.99,
        description: 'X'.repeat(500),
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should validate request with decimal amount', () => {
      const validRequest = {
        merchantCategoryCode: '5812',
        merchantName: 'STARBUCKS',
        amount: 5.75,
        description: 'STARBUCKS COFFEE',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });
  });

  describe('Invalid merchantCategoryCode', () => {
    it('should reject MCC with less than 4 characters', () => {
      const invalidRequest = {
        merchantCategoryCode: '541',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe(
          'Merchant category code must be exactly 4 characters'
        );
      }
    });

    it('should reject MCC with more than 4 characters', () => {
      const invalidRequest = {
        merchantCategoryCode: '54111',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject MCC with non-digit characters', () => {
      const invalidRequest = {
        merchantCategoryCode: 'ABCD',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe(
          'Merchant category code must contain only digits'
        );
      }
    });

    it('should reject MCC with mixed alphanumeric characters', () => {
      const invalidRequest = {
        merchantCategoryCode: '5A1B',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject empty MCC', () => {
      const invalidRequest = {
        merchantCategoryCode: '',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });
  });

  describe('Invalid merchantName', () => {
    it('should reject empty merchant name', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: '',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe('Merchant name is required');
      }
    });

    it('should reject merchant name exceeding 255 characters', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'A'.repeat(256),
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe('Merchant name cannot exceed 255 characters');
      }
    });
  });

  describe('Invalid amount', () => {
    it('should reject zero amount', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 0,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe('Amount must be positive');
      }
    });

    it('should reject negative amount', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: -50,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject non-numeric amount', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 'invalid' as unknown as number,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });
  });

  describe('Invalid description', () => {
    it('should reject empty description', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 100,
        description: '',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe('Description is required');
      }
    });

    it('should reject description exceeding 500 characters', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 100,
        description: 'X'.repeat(501),
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toBe('Description cannot exceed 500 characters');
      }
    });
  });

  describe('Missing required fields', () => {
    it('should reject request missing merchantCategoryCode', () => {
      const invalidRequest = {
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject request missing merchantName', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        amount: 100,
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject request missing amount', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        description: 'PURCHASE',
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject request missing description', () => {
      const invalidRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 100,
      };

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject completely empty request', () => {
      const invalidRequest = {};

      expect(() => CategorizeRequestSchema.parse(invalidRequest)).toThrow(ZodError);

      try {
        CategorizeRequestSchema.parse(invalidRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle request with extra fields (should pass as Zod ignores extra fields by default)', () => {
      const requestWithExtra = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
        extraField: 'should be ignored',
      };

      const result = CategorizeRequestSchema.parse(requestWithExtra);

      expect(result).toEqual({
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      });
    });

    it('should validate MCC with leading zeros', () => {
      const validRequest = {
        merchantCategoryCode: '0001',
        merchantName: 'STORE',
        amount: 100,
        description: 'PURCHASE',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result).toEqual(validRequest);
    });

    it('should validate very small positive amount', () => {
      const validRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 0.01,
        description: 'PURCHASE',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result.amount).toBe(0.01);
    });

    it('should validate very large amount', () => {
      const validRequest = {
        merchantCategoryCode: '5411',
        merchantName: 'STORE',
        amount: 99999999.99,
        description: 'PURCHASE',
      };

      const result = CategorizeRequestSchema.parse(validRequest);

      expect(result.amount).toBe(99999999.99);
    });
  });
});
