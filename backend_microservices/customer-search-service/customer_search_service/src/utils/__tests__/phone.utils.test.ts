import { normalizePhoneNumber, getPhoneVariations } from '../phone.utils';

describe('Phone Utils', () => {
  describe('normalizePhoneNumber', () => {
    it('should normalize 10-digit US number to E.164 format', () => {
      const result = normalizePhoneNumber('4155551234');
      expect(result).toBe('+14155551234');
    });

    it('should normalize 11-digit number with country code to E.164 format', () => {
      const result = normalizePhoneNumber('14155551234');
      expect(result).toBe('+14155551234');
    });

    it('should handle formatted phone numbers', () => {
      const result = normalizePhoneNumber('(415) 555-1234');
      expect(result).toBe('+14155551234');
    });

    it('should handle phone numbers with dashes', () => {
      const result = normalizePhoneNumber('415-555-1234');
      expect(result).toBe('+14155551234');
    });

    it('should handle phone numbers with spaces', () => {
      const result = normalizePhoneNumber('415 555 1234');
      expect(result).toBe('+14155551234');
    });

    it('should preserve already normalized E.164 numbers', () => {
      const result = normalizePhoneNumber('+14155551234');
      expect(result).toBe('+14155551234');
    });

    it('should handle phone numbers with dots', () => {
      const result = normalizePhoneNumber('415.555.1234');
      expect(result).toBe('+14155551234');
    });

    it('should handle mixed formatting', () => {
      const result = normalizePhoneNumber('+1 (415) 555-1234');
      expect(result).toBe('+14155551234');
    });

    it('should handle 7-digit numbers by prepending +', () => {
      const result = normalizePhoneNumber('5551234');
      expect(result).toBe('+5551234');
    });

    it('should handle empty string', () => {
      const result = normalizePhoneNumber('');
      expect(result).toBe('+');
    });

    it('should handle international numbers', () => {
      const result = normalizePhoneNumber('+441234567890');
      expect(result).toBe('+441234567890');
    });
  });

  describe('getPhoneVariations', () => {
    it('should generate multiple phone variations for US number', () => {
      const variations = getPhoneVariations('4155551234');

      expect(variations).toContain('+14155551234');
      expect(variations).toContain('14155551234');
      expect(variations).toContain('(415) 555-1234');
      expect(variations).toContain('415-555-1234');
      expect(variations).toContain('4155551234');
    });

    it('should generate variations for formatted number', () => {
      const variations = getPhoneVariations('(415) 555-1234');

      expect(variations).toContain('+14155551234');
      expect(variations).toContain('14155551234');
      expect(variations.length).toBeGreaterThan(0);
    });

    it('should generate variations for E.164 number', () => {
      const variations = getPhoneVariations('+14155551234');

      expect(variations).toContain('+14155551234');
      expect(variations).toContain('14155551234');
      expect(variations).toContain('4155551234');
      expect(variations).toContain('(415) 555-1234');
    });

    it('should remove duplicates from variations', () => {
      const variations = getPhoneVariations('4155551234');
      const uniqueVariations = [...new Set(variations)];

      expect(variations.length).toBe(uniqueVariations.length);
    });

    it('should handle 11-digit number', () => {
      const variations = getPhoneVariations('14155551234');

      expect(variations).toContain('+14155551234');
      expect(variations).toContain('4155551234');
    });

    it('should handle international number', () => {
      const variations = getPhoneVariations('+441234567890');

      expect(variations).toContain('+441234567890');
      expect(variations).toContain('441234567890');
    });

    it('should generate at least one variation', () => {
      const variations = getPhoneVariations('123');

      expect(variations.length).toBeGreaterThan(0);
    });
  });
});
