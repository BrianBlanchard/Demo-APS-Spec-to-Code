import { maskAccountId, maskSensitiveData } from '../data-masking';

describe('Data Masking', () => {
  describe('maskAccountId', () => {
    it('should mask account ID showing last 4 digits', () => {
      const accountId = '12345678901';
      const masked = maskAccountId(accountId);

      expect(masked).toBe('***8901');
    });

    it('should mask different account IDs correctly', () => {
      const testCases = [
        { input: '98765432109', expected: '***2109' },
        { input: '11111111111', expected: '***1111' },
        { input: '00000000000', expected: '***0000' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(maskAccountId(input)).toBe(expected);
      });
    });

    it('should handle short account IDs', () => {
      const accountId = '123';
      const masked = maskAccountId(accountId);

      expect(masked).toBe('***');
    });

    it('should handle account IDs with exactly 4 characters', () => {
      const accountId = '1234';
      const masked = maskAccountId(accountId);

      expect(masked).toBe('***');
    });

    it('should handle account IDs with 5 characters', () => {
      const accountId = '12345';
      const masked = maskAccountId(accountId);

      expect(masked).toBe('***2345');
    });

    it('should handle empty account ID', () => {
      const accountId = '';
      const masked = maskAccountId(accountId);

      expect(masked).toBe('***');
    });

    it('should not reveal full account number', () => {
      const accountId = '12345678901';
      const masked = maskAccountId(accountId);

      expect(masked).not.toBe(accountId);
      expect(masked).not.toContain('12345');
    });

    it('should always start with ***', () => {
      const testIds = ['12345678901', '98765432109', '11111111111'];

      testIds.forEach((id) => {
        const masked = maskAccountId(id);
        expect(masked.startsWith('***')).toBe(true);
      });
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask accountId in data object', () => {
      const data = {
        accountId: '12345678901',
        amount: 35.0,
        feeType: 'late_payment',
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBe('***8901');
      expect(masked.amount).toBe(35.0);
      expect(masked.feeType).toBe('late_payment');
    });

    it('should not modify non-sensitive fields', () => {
      const data = {
        accountId: '12345678901',
        amount: 35.0,
        feeType: 'late_payment',
        reason: 'Test reason',
      };

      const masked = maskSensitiveData(data);

      expect(masked.amount).toBe(35.0);
      expect(masked.feeType).toBe('late_payment');
      expect(masked.reason).toBe('Test reason');
    });

    it('should handle data without accountId', () => {
      const data = {
        amount: 35.0,
        feeType: 'late_payment',
      };

      const masked = maskSensitiveData(data);

      expect(masked).toEqual(data);
    });

    it('should not mutate original object', () => {
      const data = {
        accountId: '12345678901',
        amount: 35.0,
      };

      const original = { ...data };
      maskSensitiveData(data);

      expect(data).toEqual(original);
    });

    it('should handle null accountId', () => {
      const data = {
        accountId: null,
        amount: 35.0,
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBeNull();
    });

    it('should handle undefined accountId', () => {
      const data = {
        accountId: undefined,
        amount: 35.0,
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBeUndefined();
    });

    it('should handle numeric accountId gracefully', () => {
      const data = {
        accountId: 12345678901,
        amount: 35.0,
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBe(12345678901);
    });

    it('should handle empty object', () => {
      const data = {};

      const masked = maskSensitiveData(data);

      expect(masked).toEqual({});
    });

    it('should preserve other string fields', () => {
      const data = {
        accountId: '12345678901',
        transactionId: '1234567890123456',
        description: 'Fee description',
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBe('***8901');
      expect(masked.transactionId).toBe('1234567890123456');
      expect(masked.description).toBe('Fee description');
    });

    it('should handle nested objects without deep masking', () => {
      const data = {
        accountId: '12345678901',
        nested: {
          accountId: '98765432109',
        },
      };

      const masked = maskSensitiveData(data);

      expect(masked.accountId).toBe('***8901');
      expect((masked.nested as Record<string, unknown>).accountId).toBe('98765432109');
    });
  });
});
