import {
  generateCardNumber,
  generateCVV,
  maskCardNumber,
  calculateExpirationDate,
  formatExpirationDate,
  calculateEstimatedDelivery,
} from '../../src/utils/card-generator';

describe('Card Generator Utilities', () => {
  describe('generateCardNumber', () => {
    it('should generate a 16-digit card number', () => {
      const cardNumber = generateCardNumber();
      expect(cardNumber).toHaveLength(16);
    });

    it('should generate card number with only digits', () => {
      const cardNumber = generateCardNumber();
      expect(cardNumber).toMatch(/^\d{16}$/);
    });

    it('should generate unique card numbers', () => {
      const cardNumbers = new Set();
      for (let i = 0; i < 10; i++) {
        cardNumbers.add(generateCardNumber());
      }
      expect(cardNumbers.size).toBe(10);
    });
  });

  describe('generateCVV', () => {
    it('should generate a 3-digit CVV', () => {
      const cvv = generateCVV();
      expect(cvv).toHaveLength(3);
    });

    it('should generate CVV with only digits', () => {
      const cvv = generateCVV();
      expect(cvv).toMatch(/^\d{3}$/);
    });

    it('should pad CVV with leading zeros', () => {
      // Generate multiple CVVs to increase chances of getting one with leading zeros
      const cvvs = Array.from({ length: 100 }, () => generateCVV());
      cvvs.forEach((cvv) => {
        expect(cvv).toHaveLength(3);
        expect(cvv).toMatch(/^\d{3}$/);
      });
    });

    it('should generate CVVs in valid range (000-999)', () => {
      for (let i = 0; i < 10; i++) {
        const cvv = generateCVV();
        const cvvNum = parseInt(cvv, 10);
        expect(cvvNum).toBeGreaterThanOrEqual(0);
        expect(cvvNum).toBeLessThanOrEqual(999);
      }
    });
  });

  describe('maskCardNumber', () => {
    it('should mask first 12 digits of valid 16-digit card number', () => {
      const cardNumber = '1234567890123456';
      const masked = maskCardNumber(cardNumber);
      expect(masked).toBe('************3456');
    });

    it('should show last 4 digits only', () => {
      const cardNumber = '9876543210987654';
      const masked = maskCardNumber(cardNumber);
      expect(masked.slice(-4)).toBe('7654');
    });

    it('should return original if not 16 digits', () => {
      const shortCard = '12345';
      const masked = maskCardNumber(shortCard);
      expect(masked).toBe('12345');
    });

    it('should return original if longer than 16 digits', () => {
      const longCard = '12345678901234567';
      const masked = maskCardNumber(longCard);
      expect(masked).toBe('12345678901234567');
    });

    it('should handle empty string', () => {
      const masked = maskCardNumber('');
      expect(masked).toBe('');
    });
  });

  describe('calculateExpirationDate', () => {
    it('should add specified years to current date', () => {
      const now = new Date();
      const expirationDate = calculateExpirationDate(3);

      const expectedYear = now.getFullYear() + 3;
      expect(expirationDate.getFullYear()).toBe(expectedYear);
    });

    it('should set to last day of month', () => {
      const expirationDate = calculateExpirationDate(3);

      // Check that adding one day rolls over to next month
      const nextDay = new Date(expirationDate);
      nextDay.setDate(nextDay.getDate() + 1);

      expect(nextDay.getDate()).toBe(1);
    });

    it('should handle 1 year correctly', () => {
      const now = new Date();
      const expirationDate = calculateExpirationDate(1);

      expect(expirationDate.getFullYear()).toBe(now.getFullYear() + 1);
    });

    it('should handle 5 years correctly', () => {
      const now = new Date();
      const expirationDate = calculateExpirationDate(5);

      expect(expirationDate.getFullYear()).toBe(now.getFullYear() + 5);
    });

    it('should return valid date object', () => {
      const expirationDate = calculateExpirationDate(3);
      expect(expirationDate).toBeInstanceOf(Date);
      expect(isNaN(expirationDate.getTime())).toBe(false);
    });
  });

  describe('formatExpirationDate', () => {
    it('should format date as MM/YY', () => {
      const date = new Date('2027-01-31');
      const formatted = formatExpirationDate(date);
      expect(formatted).toBe('01/27');
    });

    it('should pad single digit month with zero', () => {
      const date = new Date('2027-03-31');
      const formatted = formatExpirationDate(date);
      expect(formatted).toMatch(/^\d{2}\/\d{2}$/);
      expect(formatted).toBe('03/27');
    });

    it('should handle December correctly', () => {
      const date = new Date('2027-12-31');
      const formatted = formatExpirationDate(date);
      expect(formatted).toBe('12/27');
    });

    it('should use last 2 digits of year', () => {
      const date = new Date('2027-06-30');
      const formatted = formatExpirationDate(date);
      expect(formatted.split('/')[1]).toBe('27');
    });

    it('should handle year 2030+', () => {
      const date = new Date('2030-06-30');
      const formatted = formatExpirationDate(date);
      expect(formatted).toBe('06/30');
    });
  });

  describe('calculateEstimatedDelivery', () => {
    it('should add 2 days for expedited shipping', () => {
      const now = new Date();
      const delivery = calculateEstimatedDelivery(true);

      const daysDiff = Math.floor((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(2);
    });

    it('should add 7 days for standard shipping', () => {
      const now = new Date();
      const delivery = calculateEstimatedDelivery(false);

      const daysDiff = Math.floor((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
    });

    it('should return valid date object for expedited', () => {
      const delivery = calculateEstimatedDelivery(true);
      expect(delivery).toBeInstanceOf(Date);
      expect(isNaN(delivery.getTime())).toBe(false);
    });

    it('should return valid date object for standard', () => {
      const delivery = calculateEstimatedDelivery(false);
      expect(delivery).toBeInstanceOf(Date);
      expect(isNaN(delivery.getTime())).toBe(false);
    });

    it('should return future date', () => {
      const now = new Date();
      const delivery = calculateEstimatedDelivery(true);
      expect(delivery.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});
