import { CreateAccountRequestSchema } from '../dtos';
import { AccountType } from '../enums';

describe('CreateAccountRequestSchema', () => {
  describe('Valid requests', () => {
    it('should validate a valid standard credit account request', () => {
      const validRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should validate a valid premium credit account request', () => {
      const validRequest = {
        customerId: 'CUS-2026-000125',
        accountType: AccountType.PREMIUM_CREDIT,
        creditLimit: 15000.0,
        cashAdvanceLimit: 3000.0,
        disclosureGroupCode: 'DG-PREMIUM',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate a promotional account request', () => {
      const validRequest = {
        customerId: 'CUS-2026-000126',
        accountType: AccountType.PROMOTIONAL_6MONTH,
        creditLimit: 2000.0,
        cashAdvanceLimit: 500.0,
        disclosureGroupCode: 'DG-PROMOTIONAL',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate request with minimum positive values', () => {
      const validRequest = {
        customerId: 'CUS-123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 0.01,
        cashAdvanceLimit: 0.01,
        disclosureGroupCode: 'DG-1',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid requests - missing required fields', () => {
    it('should fail validation when customerId is missing', () => {
      const invalidRequest = {
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].path).toContain('customerId');
      }
    });

    it('should fail validation when accountType is missing', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when creditLimit is missing', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when cashAdvanceLimit is missing', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when disclosureGroupCode is missing', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid requests - empty strings', () => {
    it('should fail validation when customerId is empty', () => {
      const invalidRequest = {
        customerId: '',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const customerIdError = result.error.errors.find((e) => e.path.includes('customerId'));
        expect(customerIdError?.message).toBe('Customer ID is required');
      }
    });

    it('should fail validation when disclosureGroupCode is empty', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: '',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const codeError = result.error.errors.find((e) => e.path.includes('disclosureGroupCode'));
        expect(codeError?.message).toBe('Disclosure group code is required');
      }
    });
  });

  describe('Invalid requests - invalid accountType', () => {
    it('should fail validation with invalid account type', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: 'INVALID_TYPE',
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const typeError = result.error.errors.find((e) => e.path.includes('accountType'));
        expect(typeError?.message).toBe('Invalid account type');
      }
    });
  });

  describe('Invalid requests - negative or zero values', () => {
    it('should fail validation when creditLimit is zero', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const limitError = result.error.errors.find((e) => e.path.includes('creditLimit'));
        expect(limitError?.message).toBe('Credit limit must be positive');
      }
    });

    it('should fail validation when creditLimit is negative', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: -5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when cashAdvanceLimit is zero', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        const limitError = result.error.errors.find((e) => e.path.includes('cashAdvanceLimit'));
        expect(limitError?.message).toBe('Cash advance limit must be positive');
      }
    });

    it('should fail validation when cashAdvanceLimit is negative', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: -1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid requests - wrong data types', () => {
    it('should fail validation when creditLimit is a string', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: '5000.0',
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when cashAdvanceLimit is a string', () => {
      const invalidRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: '1000.0',
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail validation when customerId is a number', () => {
      const invalidRequest = {
        customerId: 123456,
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large credit limits', () => {
      const validRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 999999999.99,
        cashAdvanceLimit: 100000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should handle decimal precision', () => {
      const validRequest = {
        customerId: 'CUS-2026-000123',
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.5555,
        cashAdvanceLimit: 1000.1111,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should fail with null values', () => {
      const invalidRequest = {
        customerId: null,
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should fail with undefined values', () => {
      const invalidRequest = {
        customerId: undefined,
        accountType: AccountType.STANDARD_CREDIT,
        creditLimit: 5000.0,
        cashAdvanceLimit: 1000.0,
        disclosureGroupCode: 'DG-STANDARD',
      };

      const result = CreateAccountRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
