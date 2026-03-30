import {
  maskSSN,
  maskGovernmentId,
  shouldShowFicoScore,
  maskSensitiveData,
} from '../../../utils/masking';
import { UserRole } from '../../../types/dtos';

describe('Masking Utilities', () => {
  describe('maskSSN', () => {
    const ssn = '123-45-6789';

    it('should return full SSN for ADMIN role', () => {
      const masked = maskSSN(ssn, UserRole.ADMIN);
      expect(masked).toBe('123-45-6789');
    });

    it('should partially mask SSN for CSR role', () => {
      const masked = maskSSN(ssn, UserRole.CSR);
      expect(masked).toBe('***-**-6789');
    });

    it('should fully mask SSN for CUSTOMER role', () => {
      const masked = maskSSN(ssn, UserRole.CUSTOMER);
      expect(masked).toBe('***-**-****');
    });

    it('should handle different SSN formats', () => {
      const ssnNoHyphens = '123456789';
      const masked = maskSSN(ssnNoHyphens, UserRole.CSR);
      expect(masked).toBe('***-**-6789');
    });

    it('should show last 4 digits for CSR', () => {
      const ssn1 = '987-65-4321';
      const masked1 = maskSSN(ssn1, UserRole.CSR);
      expect(masked1).toBe('***-**-4321');

      const ssn2 = '111-22-3333';
      const masked2 = maskSSN(ssn2, UserRole.CSR);
      expect(masked2).toBe('***-**-3333');
    });

    it('should handle edge case with short SSN', () => {
      const shortSSN = '1234';
      const masked = maskSSN(shortSSN, UserRole.CSR);
      expect(masked).toBe('***-**-1234');
    });
  });

  describe('maskGovernmentId', () => {
    it('should return full government ID for ADMIN role', () => {
      const govId = 'DL12345678';
      const masked = maskGovernmentId(govId, UserRole.ADMIN);
      expect(masked).toBe('DL12345678');
    });

    it('should partially mask government ID for CSR role', () => {
      const govId = 'DL12345678';
      const masked = maskGovernmentId(govId, UserRole.CSR);
      expect(masked).toBe('*****45678');
    });

    it('should partially mask government ID for CUSTOMER role', () => {
      const govId = 'DL12345678';
      const masked = maskGovernmentId(govId, UserRole.CUSTOMER);
      expect(masked).toBe('*****45678');
    });

    it('should handle government ID with 5 or fewer characters', () => {
      const shortId = 'DL123';
      const masked = maskGovernmentId(shortId, UserRole.CSR);
      expect(masked).toBe('DL123'); // No masking for very short IDs
    });

    it('should handle different government ID formats', () => {
      const passport = 'P123456789';
      const masked = maskGovernmentId(passport, UserRole.CSR);
      expect(masked).toBe('*****56789');

      const license = 'CA-DL-987654321';
      const masked2 = maskGovernmentId(license, UserRole.CSR);
      expect(masked2).toBe('**********54321');
    });

    it('should handle empty government ID', () => {
      const empty = '';
      const masked = maskGovernmentId(empty, UserRole.CSR);
      expect(masked).toBe('');
    });
  });

  describe('shouldShowFicoScore', () => {
    it('should return true for ADMIN role', () => {
      expect(shouldShowFicoScore(UserRole.ADMIN)).toBe(true);
    });

    it('should return false for CSR role', () => {
      expect(shouldShowFicoScore(UserRole.CSR)).toBe(false);
    });

    it('should return false for CUSTOMER role', () => {
      expect(shouldShowFicoScore(UserRole.CUSTOMER)).toBe(false);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask long values showing last 4 characters', () => {
      const value = 'EFT987654321';
      const masked = maskSensitiveData(value);
      expect(masked).toBe('********4321');
    });

    it('should fully mask values with 4 or fewer characters', () => {
      const value1 = 'ABC';
      const masked1 = maskSensitiveData(value1);
      expect(masked1).toBe('***');

      const value2 = 'ABCD';
      const masked2 = maskSensitiveData(value2);
      expect(masked2).toBe('****');
    });

    it('should handle empty string', () => {
      const value = '';
      const masked = maskSensitiveData(value);
      expect(masked).toBe('');
    });

    it('should handle single character', () => {
      const value = 'A';
      const masked = maskSensitiveData(value);
      expect(masked).toBe('*');
    });

    it('should handle SSN-like values', () => {
      const ssn = '123-45-6789';
      const masked = maskSensitiveData(ssn);
      expect(masked).toBe('*******6789');
    });

    it('should handle numeric strings', () => {
      const accountNumber = '123456789012';
      const masked = maskSensitiveData(accountNumber);
      expect(masked).toBe('********9012');
    });

    it('should preserve last 4 characters exactly', () => {
      const value = 'SENSITIVE_DATA_123';
      const masked = maskSensitiveData(value);
      expect(masked.slice(-4)).toBe(value.slice(-4));
      expect(masked.length).toBe(value.length);
    });
  });

  describe('Masking Integration', () => {
    it('should apply correct masking based on role hierarchy', () => {
      const ssn = '123-45-6789';
      const govId = 'DL12345678';

      // ADMIN sees everything
      expect(maskSSN(ssn, UserRole.ADMIN)).toBe(ssn);
      expect(maskGovernmentId(govId, UserRole.ADMIN)).toBe(govId);
      expect(shouldShowFicoScore(UserRole.ADMIN)).toBe(true);

      // CSR sees partial data
      expect(maskSSN(ssn, UserRole.CSR)).toContain('***');
      expect(maskGovernmentId(govId, UserRole.CSR)).toContain('*');
      expect(shouldShowFicoScore(UserRole.CSR)).toBe(false);

      // CUSTOMER sees least data
      expect(maskSSN(ssn, UserRole.CUSTOMER)).toBe('***-**-****');
      expect(maskGovernmentId(govId, UserRole.CUSTOMER)).toContain('*');
      expect(shouldShowFicoScore(UserRole.CUSTOMER)).toBe(false);
    });

    it('should consistently mask across different calls', () => {
      const ssn = '123-45-6789';
      const masked1 = maskSSN(ssn, UserRole.CSR);
      const masked2 = maskSSN(ssn, UserRole.CSR);
      expect(masked1).toBe(masked2);
    });

    it('should handle role changes correctly', () => {
      // Different roles should produce different results
      const adminMask = maskSSN('123-45-6789', UserRole.ADMIN);
      const csrMask = maskSSN('123-45-6789', UserRole.CSR);
      const customerMask = maskSSN('123-45-6789', UserRole.CUSTOMER);

      expect(adminMask).not.toBe(csrMask);
      expect(csrMask).not.toBe(customerMask);
      expect(adminMask).not.toBe(customerMask);
    });
  });
});
