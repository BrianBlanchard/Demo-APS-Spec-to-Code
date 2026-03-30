import { MaskingUtil } from '../../src/utils/masking.util';

describe('MaskingUtil', () => {
  describe('maskCardNumber', () => {
    it('should mask card number showing only last 4 digits', () => {
      const masked = MaskingUtil.maskCardNumber('1234567890123456');
      expect(masked).toBe('****-****-****-3456');
    });

    it('should mask different card number correctly', () => {
      const masked = MaskingUtil.maskCardNumber('4532015112830366');
      expect(masked).toBe('****-****-****-0366');
    });

    it('should mask card number with leading zeros', () => {
      const masked = MaskingUtil.maskCardNumber('0000000000001234');
      expect(masked).toBe('****-****-****-1234');
    });

    it('should mask card number with all same digits', () => {
      const masked = MaskingUtil.maskCardNumber('8888888888888888');
      expect(masked).toBe('****-****-****-8888');
    });

    it('should throw error for card number shorter than 16 digits', () => {
      expect(() => MaskingUtil.maskCardNumber('123456789012345')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should throw error for card number longer than 16 digits', () => {
      expect(() => MaskingUtil.maskCardNumber('12345678901234567')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should throw error for empty string', () => {
      expect(() => MaskingUtil.maskCardNumber('')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should handle card number with all zeros', () => {
      const masked = MaskingUtil.maskCardNumber('0000000000000000');
      expect(masked).toBe('****-****-****-0000');
    });

    it('should handle card number ending with zeros', () => {
      const masked = MaskingUtil.maskCardNumber('1234567890120000');
      expect(masked).toBe('****-****-****-0000');
    });
  });

  describe('extractLastFourDigits', () => {
    it('should extract last 4 digits from card number', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('1234567890123456');
      expect(lastFour).toBe('3456');
    });

    it('should extract last 4 digits from different card number', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('4532015112830366');
      expect(lastFour).toBe('0366');
    });

    it('should extract last 4 digits with leading zeros', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('1234567890120001');
      expect(lastFour).toBe('0001');
    });

    it('should extract last 4 zeros', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('1234567890120000');
      expect(lastFour).toBe('0000');
    });

    it('should throw error for card number shorter than 16 digits', () => {
      expect(() => MaskingUtil.extractLastFourDigits('123456789012345')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should throw error for card number longer than 16 digits', () => {
      expect(() => MaskingUtil.extractLastFourDigits('12345678901234567')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should throw error for empty string', () => {
      expect(() => MaskingUtil.extractLastFourDigits('')).toThrow(
        'Card number must be exactly 16 digits',
      );
    });

    it('should handle card number with all same digits', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('7777777777777777');
      expect(lastFour).toBe('7777');
    });

    it('should extract exactly 4 characters', () => {
      const lastFour = MaskingUtil.extractLastFourDigits('1234567890123456');
      expect(lastFour).toHaveLength(4);
    });
  });

  describe('integration between methods', () => {
    it('should mask and extract consistently', () => {
      const cardNumber = '4532015112830366';
      const masked = MaskingUtil.maskCardNumber(cardNumber);
      const lastFour = MaskingUtil.extractLastFourDigits(cardNumber);

      expect(masked).toContain(lastFour);
      expect(masked).toBe(`****-****-****-${lastFour}`);
    });

    it('should work for multiple card numbers', () => {
      const cardNumbers = [
        '1234567890123456',
        '4532015112830366',
        '5425233430109903',
        '0000000000001234',
      ];

      cardNumbers.forEach((cardNumber) => {
        const masked = MaskingUtil.maskCardNumber(cardNumber);
        const lastFour = MaskingUtil.extractLastFourDigits(cardNumber);
        expect(masked).toBe(`****-****-****-${lastFour}`);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null or undefined gracefully', () => {
      expect(() => MaskingUtil.maskCardNumber(null as any)).toThrow();
      expect(() => MaskingUtil.maskCardNumber(undefined as any)).toThrow();
      expect(() => MaskingUtil.extractLastFourDigits(null as any)).toThrow();
      expect(() => MaskingUtil.extractLastFourDigits(undefined as any)).toThrow();
    });

    it('should not accept numeric input', () => {
      expect(() => MaskingUtil.maskCardNumber(1234567890123456 as any)).toThrow();
      expect(() => MaskingUtil.extractLastFourDigits(1234567890123456 as any)).toThrow();
    });

    it('should handle card numbers with special characters', () => {
      // These should fail length check
      expect(() => MaskingUtil.maskCardNumber('1234-5678-9012-3456')).toThrow();
      expect(() => MaskingUtil.extractLastFourDigits('1234 5678 9012 3456')).toThrow();
    });
  });

  describe('PCI compliance verification', () => {
    it('should never expose full card number in mask', () => {
      const cardNumber = '4532015112830366';
      const masked = MaskingUtil.maskCardNumber(cardNumber);

      // Ensure first 12 digits are completely masked
      expect(masked).not.toContain(cardNumber.substring(0, 12));
      expect(masked).toMatch(/^\*{4}-\*{4}-\*{4}-\d{4}$/);
    });

    it('should only show last 4 digits', () => {
      const cardNumbers = ['1234567890123456', '4532015112830366', '9999999999995555'];

      cardNumbers.forEach((cardNumber) => {
        const masked = MaskingUtil.maskCardNumber(cardNumber);
        const visibleDigits = masked.replace(/[^0-9]/g, '');
        expect(visibleDigits).toHaveLength(4);
        expect(visibleDigits).toBe(cardNumber.slice(-4));
      });
    });
  });
});
