import { maskCardNumber, maskAccountId } from '../mask.util';

describe('MaskUtil - Utilities/Helpers', () => {
  describe('maskCardNumber', () => {
    it('should mask 16-digit card number correctly', () => {
      const cardNumber = '1234567890123456';
      const masked = maskCardNumber(cardNumber);
      expect(masked).toBe('************3456');
    });

    it('should return original value for invalid length', () => {
      const cardNumber = '12345678';
      const masked = maskCardNumber(cardNumber);
      expect(masked).toBe('12345678');
    });

    it('should return original value for empty string', () => {
      const cardNumber = '';
      const masked = maskCardNumber(cardNumber);
      expect(masked).toBe('');
    });

    it('should handle card numbers with all same digits', () => {
      const cardNumber = '1111111111111111';
      const masked = maskCardNumber(cardNumber);
      expect(masked).toBe('************1111');
    });
  });

  describe('maskAccountId', () => {
    it('should mask 11-character account ID correctly', () => {
      const accountId = '12345678901';
      const masked = maskAccountId(accountId);
      expect(masked).toBe('*******8901');
    });

    it('should mask longer account IDs', () => {
      const accountId = '123456789012345';
      const masked = maskAccountId(accountId);
      expect(masked).toBe('*******2345');
    });

    it('should return original value for short account IDs', () => {
      const accountId = '123';
      const masked = maskAccountId(accountId);
      expect(masked).toBe('123');
    });

    it('should return original value for empty string', () => {
      const accountId = '';
      const masked = maskAccountId(accountId);
      expect(masked).toBe('');
    });

    it('should handle exactly 4 characters', () => {
      const accountId = '1234';
      const masked = maskAccountId(accountId);
      expect(masked).toBe('*******1234');
    });
  });
});
