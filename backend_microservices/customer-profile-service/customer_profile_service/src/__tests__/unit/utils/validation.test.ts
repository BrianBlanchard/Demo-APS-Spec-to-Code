import {
  validateCustomerId,
  validateStateZipCode,
  validatePhoneNumber,
  validateUpdatePermissions,
} from '../../../utils/validation';
import { ValidationError, UnprocessableEntityError } from '../../../exceptions/AppError';

describe('Validation Utilities', () => {
  describe('validateCustomerId', () => {
    it('should accept valid 9-digit customer ID', () => {
      expect(() => validateCustomerId('123456789')).not.toThrow();
      expect(() => validateCustomerId('000000000')).not.toThrow();
      expect(() => validateCustomerId('999999999')).not.toThrow();
    });

    it('should reject customer ID with fewer than 9 digits', () => {
      expect(() => validateCustomerId('12345678')).toThrow(ValidationError);
      expect(() => validateCustomerId('1234')).toThrow(ValidationError);
      expect(() => validateCustomerId('1')).toThrow(ValidationError);
    });

    it('should reject customer ID with more than 9 digits', () => {
      expect(() => validateCustomerId('1234567890')).toThrow(ValidationError);
      expect(() => validateCustomerId('12345678901')).toThrow(ValidationError);
    });

    it('should reject customer ID with non-numeric characters', () => {
      expect(() => validateCustomerId('12345678A')).toThrow(ValidationError);
      expect(() => validateCustomerId('ABC123456')).toThrow(ValidationError);
      expect(() => validateCustomerId('123-456-789')).toThrow(ValidationError);
    });

    it('should reject empty customer ID', () => {
      expect(() => validateCustomerId('')).toThrow(ValidationError);
    });

    it('should throw ValidationError with correct message', () => {
      try {
        validateCustomerId('12345');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Customer ID must be exactly 9 digits');
      }
    });
  });

  describe('validateStateZipCode', () => {
    it('should accept valid IL zip codes', () => {
      expect(() => validateStateZipCode('IL', '60601')).not.toThrow();
      expect(() => validateStateZipCode('IL', '61820')).not.toThrow();
      expect(() => validateStateZipCode('IL', '62701')).not.toThrow();
    });

    it('should accept valid NY zip codes', () => {
      expect(() => validateStateZipCode('NY', '10001')).not.toThrow();
      expect(() => validateStateZipCode('NY', '11201')).not.toThrow();
      expect(() => validateStateZipCode('NY', '12345')).not.toThrow();
    });

    it('should accept valid CA zip codes', () => {
      expect(() => validateStateZipCode('CA', '90210')).not.toThrow();
      expect(() => validateStateZipCode('CA', '94102')).not.toThrow();
      expect(() => validateStateZipCode('CA', '95814')).not.toThrow();
    });

    it('should accept valid TX zip codes', () => {
      expect(() => validateStateZipCode('TX', '75001')).not.toThrow();
      expect(() => validateStateZipCode('TX', '78701')).not.toThrow();
      expect(() => validateStateZipCode('TX', '79936')).not.toThrow();
    });

    it('should accept valid FL zip codes', () => {
      expect(() => validateStateZipCode('FL', '32801')).not.toThrow();
      expect(() => validateStateZipCode('FL', '33139')).not.toThrow();
      expect(() => validateStateZipCode('FL', '34102')).not.toThrow();
    });

    it('should reject invalid IL zip code', () => {
      expect(() => validateStateZipCode('IL', '90210')).toThrow(UnprocessableEntityError);
      expect(() => validateStateZipCode('IL', '10001')).toThrow(UnprocessableEntityError);
    });

    it('should reject invalid NY zip code', () => {
      expect(() => validateStateZipCode('NY', '60601')).toThrow(UnprocessableEntityError);
      expect(() => validateStateZipCode('NY', '90210')).toThrow(UnprocessableEntityError);
    });

    it('should accept unknown state without validation', () => {
      // States not in the validation map should be accepted
      expect(() => validateStateZipCode('WA', '98101')).not.toThrow();
      expect(() => validateStateZipCode('OR', '97201')).not.toThrow();
    });

    it('should throw UnprocessableEntityError with details', () => {
      try {
        validateStateZipCode('IL', '90210');
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect((error as UnprocessableEntityError).message).toContain('does not match state IL');
        expect((error as UnprocessableEntityError).details).toBeDefined();
        expect((error as UnprocessableEntityError).details?.state).toBe('IL');
        expect((error as UnprocessableEntityError).details?.zipCode).toBe('90210');
      }
    });

    it('should provide expected prefixes in error message', () => {
      try {
        validateStateZipCode('IL', '90210');
      } catch (error) {
        expect((error as UnprocessableEntityError).message).toContain('60, 61, 62');
      }
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept valid phone numbers', () => {
      expect(() => validatePhoneNumber('312-555-0123')).not.toThrow();
      expect(() => validatePhoneNumber('555-123-4567')).not.toThrow();
      expect(() => validatePhoneNumber('000-000-0000')).not.toThrow();
    });

    it('should reject phone number without hyphens', () => {
      expect(() => validatePhoneNumber('3125550123')).toThrow(ValidationError);
    });

    it('should reject phone number with incorrect format', () => {
      expect(() => validatePhoneNumber('312.555.0123')).toThrow(ValidationError);
      expect(() => validatePhoneNumber('312 555 0123')).toThrow(ValidationError);
      expect(() => validatePhoneNumber('(312) 555-0123')).toThrow(ValidationError);
    });

    it('should reject phone number with wrong segment lengths', () => {
      expect(() => validatePhoneNumber('12-555-0123')).toThrow(ValidationError);
      expect(() => validatePhoneNumber('312-55-0123')).toThrow(ValidationError);
      expect(() => validatePhoneNumber('312-555-012')).toThrow(ValidationError);
    });

    it('should reject phone number with letters', () => {
      expect(() => validatePhoneNumber('ABC-DEF-GHIJ')).toThrow(ValidationError);
      expect(() => validatePhoneNumber('312-ABC-0123')).toThrow(ValidationError);
    });

    it('should reject empty phone number', () => {
      expect(() => validatePhoneNumber('')).toThrow(ValidationError);
    });

    it('should throw ValidationError with expected format message', () => {
      try {
        validatePhoneNumber('3125550123');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('XXX-XXX-XXXX');
      }
    });
  });

  describe('validateUpdatePermissions', () => {
    it('should allow ADMIN to update restricted fields', () => {
      expect(() => validateUpdatePermissions('ssn', 'ADMIN')).not.toThrow();
      expect(() => validateUpdatePermissions('date_of_birth', 'ADMIN')).not.toThrow();
      expect(() => validateUpdatePermissions('fico_score', 'ADMIN')).not.toThrow();
      expect(() => validateUpdatePermissions('government_id', 'ADMIN')).not.toThrow();
    });

    it('should allow ADMIN to update non-restricted fields', () => {
      expect(() => validateUpdatePermissions('phone1', 'ADMIN')).not.toThrow();
      expect(() => validateUpdatePermissions('address_line1', 'ADMIN')).not.toThrow();
      expect(() => validateUpdatePermissions('city', 'ADMIN')).not.toThrow();
    });

    it('should reject CSR updating SSN', () => {
      expect(() => validateUpdatePermissions('ssn', 'CSR')).toThrow(UnprocessableEntityError);
    });

    it('should reject CSR updating date of birth', () => {
      expect(() => validateUpdatePermissions('date_of_birth', 'CSR')).toThrow(UnprocessableEntityError);
    });

    it('should reject CSR updating FICO score', () => {
      expect(() => validateUpdatePermissions('fico_score', 'CSR')).toThrow(UnprocessableEntityError);
    });

    it('should reject CSR updating government ID', () => {
      expect(() => validateUpdatePermissions('government_id', 'CSR')).toThrow(UnprocessableEntityError);
    });

    it('should allow CSR to update non-restricted fields', () => {
      expect(() => validateUpdatePermissions('phone1', 'CSR')).not.toThrow();
      expect(() => validateUpdatePermissions('address_line1', 'CSR')).not.toThrow();
      expect(() => validateUpdatePermissions('zip_code', 'CSR')).not.toThrow();
    });

    it('should reject CUSTOMER updating restricted fields', () => {
      expect(() => validateUpdatePermissions('ssn', 'CUSTOMER')).toThrow(UnprocessableEntityError);
      expect(() => validateUpdatePermissions('fico_score', 'CUSTOMER')).toThrow(UnprocessableEntityError);
    });

    it('should allow CUSTOMER to update non-restricted fields', () => {
      expect(() => validateUpdatePermissions('phone1', 'CUSTOMER')).not.toThrow();
      expect(() => validateUpdatePermissions('address_line1', 'CUSTOMER')).not.toThrow();
    });

    it('should throw UnprocessableEntityError with field name in message', () => {
      try {
        validateUpdatePermissions('ssn', 'CSR');
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect((error as UnprocessableEntityError).message).toContain('ssn');
        expect((error as UnprocessableEntityError).message).toContain('cannot be modified via self-service');
      }
    });
  });

  describe('Validation Integration', () => {
    it('should validate complete customer update', () => {
      // Valid update scenario
      const customerId = '123456789';
      const state = 'IL';
      const zipCode = '60601';
      const phone = '312-555-0123';

      expect(() => {
        validateCustomerId(customerId);
        validateStateZipCode(state, zipCode);
        validatePhoneNumber(phone);
      }).not.toThrow();
    });

    it('should catch all validation errors in sequence', () => {
      const customerId = '12345'; // Invalid
      const state = 'IL';
      const zipCode = '90210'; // Invalid for IL
      const phone = '3125550123'; // Invalid format

      expect(() => validateCustomerId(customerId)).toThrow(ValidationError);
      expect(() => validateStateZipCode(state, zipCode)).toThrow(UnprocessableEntityError);
      expect(() => validatePhoneNumber(phone)).toThrow(ValidationError);
    });

    it('should validate permissions with different field types', () => {
      const role = 'CSR';

      // Should pass for allowed fields
      expect(() => {
        validateUpdatePermissions('phone1', role);
        validateUpdatePermissions('address_line1', role);
        validateUpdatePermissions('city', role);
      }).not.toThrow();

      // Should fail for restricted fields
      expect(() => validateUpdatePermissions('ssn', role)).toThrow();
      expect(() => validateUpdatePermissions('fico_score', role)).toThrow();
    });
  });
});
