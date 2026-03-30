import { encrypt, decrypt, maskSensitiveData } from '../../src/utils/encryption.util';

describe('Encryption Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const original = 'Hello World';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should encrypt SSN and decrypt correctly', () => {
      const ssn = '123-45-6789';
      const encrypted = encrypt(ssn);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(ssn);
      expect(decrypted).toBe(ssn);
    });

    it('should produce different encrypted values for same input', () => {
      const text = 'sensitive data';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      // Due to random IV, encrypted values should be different
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same value
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it('should handle empty string', () => {
      const original = '';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle special characters', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle unicode characters', () => {
      const original = '日本語テスト';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle long text', () => {
      const original = 'A'.repeat(1000);
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should produce encrypted text containing colon separator', () => {
      const text = 'test';
      const encrypted = encrypt(text);

      expect(encrypted).toContain(':');
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(2);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data with default visible characters (4)', () => {
      const data = '123-45-6789';
      const masked = maskSensitiveData(data);

      expect(masked).toBe('*******6789');
      expect(masked).toHaveLength(data.length);
    });

    it('should mask data with custom visible characters', () => {
      const data = '123456789';
      const masked = maskSensitiveData(data, 2);

      expect(masked).toBe('*******89');
    });

    it('should mask SSN showing last 4 digits', () => {
      const ssn = '123-45-6789';
      const masked = maskSensitiveData(ssn, 4);

      expect(masked).toBe('*******6789');
    });

    it('should handle data shorter than visible characters', () => {
      const data = '123';
      const masked = maskSensitiveData(data, 4);

      expect(masked).toBe('***');
    });

    it('should handle empty string', () => {
      const data = '';
      const masked = maskSensitiveData(data);

      expect(masked).toBe('');
    });

    it('should handle single character', () => {
      const data = 'A';
      const masked = maskSensitiveData(data, 4);

      expect(masked).toBe('*');
    });

    it('should mask customer ID showing last 4 characters', () => {
      const customerId = '123456789';
      const masked = maskSensitiveData(customerId, 4);

      expect(masked).toBe('*****6789');
      expect(masked.slice(-4)).toBe('6789');
    });

    it('should mask government ID', () => {
      const govId = 'DL12345678';
      const masked = maskSensitiveData(govId, 4);

      expect(masked).toBe('******5678');
    });

    it('should mask all characters when 0 visible specified', () => {
      const data = '123456';
      const masked = maskSensitiveData(data, 0);

      expect(masked).toBe('******');
    });
  });
});
