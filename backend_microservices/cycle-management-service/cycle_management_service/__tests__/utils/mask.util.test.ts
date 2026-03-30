import { maskAccountNumber, maskSensitiveData } from '../../src/utils/mask.util';

describe('Mask Utility', () => {
  describe('maskAccountNumber', () => {
    it('should mask account number showing only last 4 digits', () => {
      const result = maskAccountNumber('1234567890');
      expect(result).toBe('****7890');
    });

    it('should handle short account numbers', () => {
      expect(maskAccountNumber('123')).toBe('****');
      expect(maskAccountNumber('1234')).toBe('****');
    });

    it('should handle long account numbers', () => {
      const result = maskAccountNumber('12345678901234567890');
      expect(result).toBe('****7890');
    });

    it('should handle exactly 8 characters', () => {
      const result = maskAccountNumber('12345678');
      expect(result).toBe('****5678');
    });

    it('should handle empty string', () => {
      const result = maskAccountNumber('');
      expect(result).toBe('****');
    });

    it('should handle single character', () => {
      const result = maskAccountNumber('1');
      expect(result).toBe('****');
    });

    it('should preserve last 4 digits exactly', () => {
      const accountNumber = '9876543210';
      const result = maskAccountNumber(accountNumber);
      expect(result).toMatch(/^\*{4}3210$/);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask accountNumber in data object', () => {
      const data = {
        accountNumber: '1234567890',
        amount: 100.50,
      };

      const result = maskSensitiveData(data);
      expect(result.accountNumber).toBe('****7890');
      expect(result.amount).toBe(100.50);
    });

    it('should mask accountId in data object', () => {
      const data = {
        accountId: '9876543210',
        status: 'ACTIVE',
      };

      const result = maskSensitiveData(data);
      expect(result.accountId).toBe('****3210');
      expect(result.status).toBe('ACTIVE');
    });

    it('should mask both accountNumber and accountId', () => {
      const data = {
        accountNumber: '1234567890',
        accountId: '9876543210',
        billingCycle: '2024-01',
      };

      const result = maskSensitiveData(data);
      expect(result.accountNumber).toBe('****7890');
      expect(result.accountId).toBe('****3210');
      expect(result.billingCycle).toBe('2024-01');
    });

    it('should not modify object without sensitive fields', () => {
      const data = {
        amount: 100.50,
        billingCycle: '2024-01',
        status: 'ACTIVE',
      };

      const result = maskSensitiveData(data);
      expect(result).toEqual(data);
    });

    it('should not mutate original object', () => {
      const original = {
        accountNumber: '1234567890',
        amount: 100.50,
      };

      const result = maskSensitiveData(original);

      expect(original.accountNumber).toBe('1234567890');
      expect(result.accountNumber).toBe('****7890');
    });

    it('should handle empty object', () => {
      const result = maskSensitiveData({});
      expect(result).toEqual({});
    });

    it('should handle numeric accountId and accountNumber', () => {
      const data = {
        accountNumber: 1234567890,
        accountId: 9876543210,
      };

      const result = maskSensitiveData(data);
      expect(result.accountNumber).toBe('****7890');
      expect(result.accountId).toBe('****3210');
    });
  });
});
