import { isEmailLike, isPhoneLike, maskSensitiveData } from '../query.utils';

describe('Query Utils', () => {
  describe('isEmailLike', () => {
    it('should return true for valid email addresses', () => {
      expect(isEmailLike('john.smith@example.com')).toBe(true);
      expect(isEmailLike('user@domain.co.uk')).toBe(true);
      expect(isEmailLike('test+tag@example.org')).toBe(true);
      expect(isEmailLike('simple@test.io')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isEmailLike('notanemail')).toBe(false);
      expect(isEmailLike('missing@domain')).toBe(false);
      expect(isEmailLike('@example.com')).toBe(false);
      expect(isEmailLike('user@')).toBe(false);
      expect(isEmailLike('user @example.com')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isEmailLike('')).toBe(false);
    });

    it('should return false for phone numbers', () => {
      expect(isEmailLike('4155551234')).toBe(false);
      expect(isEmailLike('+14155551234')).toBe(false);
    });

    it('should return false for names', () => {
      expect(isEmailLike('John Smith')).toBe(false);
    });
  });

  describe('isPhoneLike', () => {
    it('should return true for 10-digit phone numbers', () => {
      expect(isPhoneLike('4155551234')).toBe(true);
    });

    it('should return true for 11-digit phone numbers', () => {
      expect(isPhoneLike('14155551234')).toBe(true);
    });

    it('should return true for formatted phone numbers', () => {
      expect(isPhoneLike('(415) 555-1234')).toBe(true);
      expect(isPhoneLike('415-555-1234')).toBe(true);
      expect(isPhoneLike('415.555.1234')).toBe(true);
      expect(isPhoneLike('+1 (415) 555-1234')).toBe(true);
    });

    it('should return true for E.164 format', () => {
      expect(isPhoneLike('+14155551234')).toBe(true);
      expect(isPhoneLike('+441234567890')).toBe(true);
    });

    it('should return false for short numbers', () => {
      expect(isPhoneLike('123')).toBe(false);
      expect(isPhoneLike('12345')).toBe(false);
      expect(isPhoneLike('123456789')).toBe(false);
    });

    it('should return false for names', () => {
      expect(isPhoneLike('John Smith')).toBe(false);
    });

    it('should return false for emails', () => {
      expect(isPhoneLike('john@example.com')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isPhoneLike('')).toBe(false);
    });

    it('should handle international numbers', () => {
      expect(isPhoneLike('+441234567890')).toBe(true);
      expect(isPhoneLike('+33123456789')).toBe(true);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data showing only first 4 characters', () => {
      const result = maskSensitiveData('john.smith@example.com');
      expect(result).toBe('john***');
    });

    it('should mask data showing custom visible characters', () => {
      const result = maskSensitiveData('john.smith@example.com', 8);
      expect(result).toBe('john.smi***');
    });

    it('should return *** for data shorter than visible chars', () => {
      const result = maskSensitiveData('abc', 4);
      expect(result).toBe('***');
    });

    it('should return *** for data equal to visible chars', () => {
      const result = maskSensitiveData('abcd', 4);
      expect(result).toBe('***');
    });

    it('should handle empty strings', () => {
      const result = maskSensitiveData('');
      expect(result).toBe('***');
    });

    it('should mask phone numbers', () => {
      const result = maskSensitiveData('+14155551234', 4);
      expect(result).toBe('+141***');
    });

    it('should mask user IDs', () => {
      const result = maskSensitiveData('user-12345678', 4);
      expect(result).toBe('user***');
    });

    it('should mask with default 4 visible chars', () => {
      const result = maskSensitiveData('sensitive-data-here');
      expect(result).toBe('sens***');
    });

    it('should handle single character', () => {
      const result = maskSensitiveData('a');
      expect(result).toBe('***');
    });

    it('should mask loyalty cards', () => {
      const result = maskSensitiveData('PGA12345678', 3);
      expect(result).toBe('PGA***');
    });
  });
});
