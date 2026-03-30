import { validateLuhn } from '../../../src/utils/luhn.util';

describe('Luhn Utility', () => {
  describe('Valid Card Numbers', () => {
    it('should validate a valid Visa card number', () => {
      expect(validateLuhn('4111111111111111')).toBe(true);
    });

    it('should validate another valid Visa card', () => {
      expect(validateLuhn('4012888888881881')).toBe(true);
    });

    it('should validate MasterCard number', () => {
      expect(validateLuhn('5555555555554444')).toBe(true);
    });

    it('should validate another MasterCard', () => {
      expect(validateLuhn('5105105105105100')).toBe(true);
    });

    it('should validate American Express number (15 digits)', () => {
      expect(validateLuhn('378282246310005')).toBe(true);
    });

    it('should validate Discover card number', () => {
      expect(validateLuhn('6011111111111117')).toBe(true);
    });
  });

  describe('Invalid Card Numbers', () => {
    it('should reject invalid 16-digit card number', () => {
      expect(validateLuhn('4111111111111112')).toBe(false);
    });

    it('should reject number failing Luhn check', () => {
      expect(validateLuhn('1234567890123456')).toBe(false);
    });

    it('should reject card number with non-numeric characters', () => {
      expect(validateLuhn('411111111111111A')).toBe(false);
    });

    it('should reject card number with spaces', () => {
      expect(validateLuhn('4111 1111 1111 1111')).toBe(false);
    });

    it('should reject card number with dashes', () => {
      expect(validateLuhn('4111-1111-1111-1111')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateLuhn('')).toBe(false);
    });

    it('should reject short invalid number', () => {
      expect(validateLuhn('123')).toBe(false);
    });

    it('should reject incrementing sequence', () => {
      expect(validateLuhn('1234567890123456')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle short valid number', () => {
      expect(validateLuhn('0')).toBe(true);
    });

    it('should handle very long number', () => {
      const longNumber = '4532123456781234' + '0'.repeat(100);
      expect(typeof validateLuhn(longNumber)).toBe('boolean');
    });
  });
});
