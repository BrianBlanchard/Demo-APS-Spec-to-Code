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
    });

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
    });
  });
});
