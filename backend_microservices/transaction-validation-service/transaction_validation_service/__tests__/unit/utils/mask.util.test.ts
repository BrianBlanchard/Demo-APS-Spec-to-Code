import { maskCardNumber, maskSensitiveData } from '../../../src/utils/mask.util';

describe('Mask Utility', () => {
  describe('maskCardNumber', () => {
    it('should mask 16-digit card number showing last 4 digits', () => {
      expect(maskCardNumber('4532123456781234')).toBe('************1234');
    });

    it('should mask another card number', () => {
      expect(maskCardNumber('5425233430109903')).toBe('************9903');
    });

    it('should handle short card number', () => {
      expect(maskCardNumber('123')).toBe('***');
    });

    it('should handle 4-digit number', () => {
      expect(maskCardNumber('1234')).toBe('1234');
    });

    it('should handle single character', () => {
      expect(maskCardNumber('1')).toBe('*');
    });

    it('should handle empty string', () => {
      expect(maskCardNumber('')).toBe('');
    });

    it('should handle 15-digit American Express number', () => {
      expect(maskCardNumber('378282246310005')).toBe('***********0005');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask cardNumber field', () => {
      const data = {
        cardNumber: '4532123456781234',
        amount: 100,
      };
      const masked = maskSensitiveData(data);
      expect(masked.cardNumber).toBe('************1234');
      expect(masked.amount).toBe(100);
    });

    it('should mask CVV field', () => {
      const data = {
        cvv: '123',
        amount: 100,
      };
      const masked = maskSensitiveData(data);
      expect(masked.cvv).toBe('***');
      expect(masked.amount).toBe(100);
    });

    it('should mask both cardNumber and CVV', () => {
      const data = {
        cardNumber: '4532123456781234',
        cvv: '123',
        amount: 100,
      };
      const masked = maskSensitiveData(data);
      expect(masked.cardNumber).toBe('************1234');
      expect(masked.cvv).toBe('***');
      expect(masked.amount).toBe(100);
    });

    it('should not modify data without sensitive fields', () => {
      const data = {
        amount: 100,
        merchantId: 'MERCH123',
      };
      const masked = maskSensitiveData(data);
      expect(masked.amount).toBe(100);
      expect(masked.merchantId).toBe('MERCH123');
    });

    it('should handle empty object', () => {
      const masked = maskSensitiveData({});
      expect(masked).toEqual({});
    });

    it('should create new object and not modify original', () => {
      const original = {
        cardNumber: '4532123456781234',
        amount: 100,
      };
      const masked = maskSensitiveData(original);
      expect(original.cardNumber).toBe('4532123456781234');
      expect(masked.cardNumber).toBe('************1234');
    });

    it('should handle null CVV', () => {
      const data = {
        cvv: null,
        amount: 100,
      };
      const masked = maskSensitiveData(data);
      expect(masked.cvv).toBe('***');
    });

    it('should handle undefined CVV', () => {
      const data: Record<string, unknown> = {
        cvv: undefined,
        amount: 100,
      };
      const masked = maskSensitiveData(data);
      expect(masked.cvv).toBe('***');
    });
  });
});
