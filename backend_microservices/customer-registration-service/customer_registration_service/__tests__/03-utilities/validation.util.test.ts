import {
  validateSSN,
  validatePhoneAreaCode,
  validateStateZipCodeMatch,
  validateFicoScore,
  validateAge,
  validateNameField,
  calculateCreditLimit,
  generateCustomerId,
} from '../../src/utils/validation.util';
import { UnprocessableEntityError } from '../../src/types/error.types';

describe('Validation Utilities', () => {
  describe('validateSSN', () => {
    it('should pass for valid SSN', () => {
      expect(() => validateSSN('123-45-6789')).not.toThrow();
      expect(() => validateSSN('567-89-1234')).not.toThrow();
    });

    it('should throw for SSN with 000 in first part', () => {
      expect(() => validateSSN('000-45-6789')).toThrow(UnprocessableEntityError);
      expect(() => validateSSN('000-45-6789')).toThrow(
        'SSN first part cannot be 000, 666, or 900-999'
      );
    });

    it('should throw for SSN with 666 in first part', () => {
      expect(() => validateSSN('666-45-6789')).toThrow(UnprocessableEntityError);
    });

    it('should throw for SSN in 900-999 range', () => {
      expect(() => validateSSN('900-45-6789')).toThrow(UnprocessableEntityError);
      expect(() => validateSSN('950-45-6789')).toThrow(UnprocessableEntityError);
      expect(() => validateSSN('999-45-6789')).toThrow(UnprocessableEntityError);
    });

    it('should throw for invalid SSN length', () => {
      expect(() => validateSSN('12-34-567')).toThrow(UnprocessableEntityError);
      expect(() => validateSSN('12-34-567')).toThrow('SSN must be 9 digits');
    });
  });

  describe('validatePhoneAreaCode', () => {
    it('should pass for valid phone area codes', () => {
      expect(() => validatePhoneAreaCode('312-555-0123')).not.toThrow();
      expect(() => validatePhoneAreaCode('415-555-0123')).not.toThrow();
      expect(() => validatePhoneAreaCode('(312) 555-0123')).not.toThrow();
    });

    it('should throw for invalid area code starting with 0', () => {
      expect(() => validatePhoneAreaCode('012-555-0123')).toThrow(UnprocessableEntityError);
      expect(() => validatePhoneAreaCode('012-555-0123')).toThrow('Invalid phone area code');
    });

    it('should throw for invalid area code starting with 1', () => {
      expect(() => validatePhoneAreaCode('112-555-0123')).toThrow(UnprocessableEntityError);
    });
  });

  describe('validateStateZipCodeMatch', () => {
    it('should pass for valid IL state and 60xxx ZIP', () => {
      expect(() => validateStateZipCodeMatch('IL', '60601')).not.toThrow();
      expect(() => validateStateZipCodeMatch('IL', '61234')).not.toThrow();
    });

    it('should pass for valid CA state and 9xxxx ZIP', () => {
      expect(() => validateStateZipCodeMatch('CA', '90210')).not.toThrow();
      expect(() => validateStateZipCodeMatch('CA', '94102')).not.toThrow();
    });

    it('should throw for IL state with incorrect ZIP', () => {
      expect(() => validateStateZipCodeMatch('IL', '90210')).toThrow(UnprocessableEntityError);
      expect(() => validateStateZipCodeMatch('IL', '90210')).toThrow(
        'State code must match ZIP code region'
      );
    });

    it('should pass for unmapped states', () => {
      // States not in the map should pass validation
      expect(() => validateStateZipCodeMatch('WA', '98101')).not.toThrow();
    });
  });

  describe('validateFicoScore', () => {
    it('should pass for valid FICO scores', () => {
      expect(() => validateFicoScore(300)).not.toThrow();
      expect(() => validateFicoScore(500)).not.toThrow();
      expect(() => validateFicoScore(720)).not.toThrow();
      expect(() => validateFicoScore(850)).not.toThrow();
    });

    it('should throw for FICO score below 300', () => {
      expect(() => validateFicoScore(299)).toThrow(UnprocessableEntityError);
      expect(() => validateFicoScore(299)).toThrow('FICO score must be between 300 and 850');
    });

    it('should throw for FICO score above 850', () => {
      expect(() => validateFicoScore(851)).toThrow(UnprocessableEntityError);
      expect(() => validateFicoScore(900)).toThrow('FICO score must be between 300 and 850');
    });

    it('should throw for FICO score of 0', () => {
      expect(() => validateFicoScore(0)).toThrow(UnprocessableEntityError);
    });
  });

  describe('validateAge', () => {
    it('should pass for customers 18 years or older', () => {
      const date20YearsAgo = new Date();
      date20YearsAgo.setFullYear(date20YearsAgo.getFullYear() - 20);
      expect(() => validateAge(date20YearsAgo.toISOString().split('T')[0])).not.toThrow();

      const date18YearsAgo = new Date();
      date18YearsAgo.setFullYear(date18YearsAgo.getFullYear() - 18);
      date18YearsAgo.setDate(date18YearsAgo.getDate() - 1);
      expect(() => validateAge(date18YearsAgo.toISOString().split('T')[0])).not.toThrow();
    });

    it('should throw for customers under 18', () => {
      const date17YearsAgo = new Date();
      date17YearsAgo.setFullYear(date17YearsAgo.getFullYear() - 17);
      expect(() => validateAge(date17YearsAgo.toISOString().split('T')[0])).toThrow(
        UnprocessableEntityError
      );
      expect(() => validateAge(date17YearsAgo.toISOString().split('T')[0])).toThrow(
        'Customer must be at least 18 years old'
      );
    });

    it('should throw for customers exactly 18 years old but birthday not yet this year', () => {
      const date18YearsFuture = new Date();
      date18YearsFuture.setFullYear(date18YearsFuture.getFullYear() - 18);
      date18YearsFuture.setDate(date18YearsFuture.getDate() + 1);
      expect(() => validateAge(date18YearsFuture.toISOString().split('T')[0])).toThrow(
        UnprocessableEntityError
      );
    });
  });

  describe('validateNameField', () => {
    it('should pass for valid names with alphabetic characters', () => {
      expect(() => validateNameField('John', 'firstName')).not.toThrow();
      expect(() => validateNameField('Mary Jane', 'firstName')).not.toThrow();
      expect(() => validateNameField('OConnor', 'lastName')).not.toThrow();
    });

    it('should throw for names with numbers', () => {
      expect(() => validateNameField('John123', 'firstName')).toThrow(UnprocessableEntityError);
      expect(() => validateNameField('John123', 'firstName')).toThrow(
        'firstName must contain only alphabetic characters and spaces'
      );
    });

    it('should throw for names with special characters', () => {
      expect(() => validateNameField('John@Doe', 'lastName')).toThrow(UnprocessableEntityError);
      expect(() => validateNameField('John-Doe', 'lastName')).toThrow(UnprocessableEntityError);
    });

    it('should pass for names with spaces', () => {
      expect(() => validateNameField('Mary Jane', 'middleName')).not.toThrow();
    });
  });

  describe('calculateCreditLimit', () => {
    it('should return 15000 for FICO score 800+', () => {
      expect(calculateCreditLimit(800)).toBe(15000);
      expect(calculateCreditLimit(850)).toBe(15000);
    });

    it('should return 10000 for FICO score 740-799', () => {
      expect(calculateCreditLimit(740)).toBe(10000);
      expect(calculateCreditLimit(799)).toBe(10000);
    });

    it('should return 5000 for FICO score 670-739', () => {
      expect(calculateCreditLimit(670)).toBe(5000);
      expect(calculateCreditLimit(720)).toBe(5000);
      expect(calculateCreditLimit(739)).toBe(5000);
    });

    it('should return 2000 for FICO score 580-669', () => {
      expect(calculateCreditLimit(580)).toBe(2000);
      expect(calculateCreditLimit(669)).toBe(2000);
    });

    it('should return 1000 for FICO score below 580', () => {
      expect(calculateCreditLimit(300)).toBe(1000);
      expect(calculateCreditLimit(579)).toBe(1000);
    });
  });

  describe('generateCustomerId', () => {
    it('should generate 9-digit customer ID', () => {
      const customerId = generateCustomerId();
      expect(customerId).toHaveLength(9);
      expect(customerId).toMatch(/^\d{9}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateCustomerId());
      }
      expect(ids.size).toBeGreaterThan(90); // Allow some collisions but expect mostly unique
    });

    it('should not generate ID starting with 0', () => {
      for (let i = 0; i < 10; i++) {
        const customerId = generateCustomerId();
        expect(parseInt(customerId, 10)).toBeGreaterThanOrEqual(100000000);
      }
    });
  });
});
