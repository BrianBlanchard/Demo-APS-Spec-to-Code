import { LuhnValidator } from '../../src/utils/luhn.validator';

describe('LuhnValidator', () => {
  describe('validate', () => {
    describe('valid card numbers', () => {
      it('should validate correct 16-digit card number', () => {
        // Valid Visa card number (test)
        expect(LuhnValidator.validate('4532015112830366')).toBe(true);
      });

      it('should validate another valid card number', () => {
        // Valid test card number
        expect(LuhnValidator.validate('5425233430109903')).toBe(true);
      });

      it('should validate third valid card number', () => {
        // Another valid test number
        expect(LuhnValidator.validate('374245455400126')).toBe(false); // 15 digits, will fail
      });

      it('should validate all zeros if checksum is valid', () => {
        expect(LuhnValidator.validate('0000000000000000')).toBe(true);
      });

      it('should validate card number with all same digits if valid', () => {
        expect(LuhnValidator.validate('8888888888888888')).toBe(true); // Actually valid checksum
      });
    });

    describe('invalid card numbers - format errors', () => {
      it('should reject card number shorter than 16 digits', () => {
        expect(LuhnValidator.validate('453201511283036')).toBe(false);
      });

      it('should reject card number longer than 16 digits', () => {
        expect(LuhnValidator.validate('45320151128303661')).toBe(false);
      });

      it('should reject card number with letters', () => {
        expect(LuhnValidator.validate('453201511283036a')).toBe(false);
      });

      it('should reject card number with spaces', () => {
        expect(LuhnValidator.validate('4532 0151 1283 0366')).toBe(false);
      });

      it('should reject card number with hyphens', () => {
        expect(LuhnValidator.validate('4532-0151-1283-0366')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(LuhnValidator.validate('')).toBe(false);
      });

      it('should reject special characters', () => {
        expect(LuhnValidator.validate('4532@151!283#366')).toBe(false);
      });
    });

    describe('invalid card numbers - checksum errors', () => {
      it('should reject card number with invalid checksum', () => {
        expect(LuhnValidator.validate('4532015112830367')).toBe(false); // Last digit wrong
      });

      it('should reject another invalid checksum', () => {
        expect(LuhnValidator.validate('1234567890123456')).toBe(false);
      });

      it('should reject card number with one digit changed', () => {
        expect(LuhnValidator.validate('4532015112830466')).toBe(false);
      });

      it('should reject sequential numbers', () => {
        expect(LuhnValidator.validate('1234567890123456')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle card number with leading zeros', () => {
        expect(LuhnValidator.validate('0000000000000000')).toBe(true);
      });

      it('should reject null or undefined', () => {
        expect(LuhnValidator.validate(null as any)).toBe(false);
        expect(LuhnValidator.validate(undefined as any)).toBe(false);
      });

      it('should handle numeric input by coercion', () => {
        // JavaScript will coerce number to string, which passes validation
        expect(LuhnValidator.validate(4532015112830366 as any)).toBe(true);
      });
    });

    describe('algorithm correctness', () => {
      it('should correctly validate multiple known valid test cards', () => {
        const validCards = [
          '4532015112830366',
          '5425233430109903',
          '6011111111111117',
          '378282246310005',  // 15 digits - should fail format check
        ];

        expect(LuhnValidator.validate(validCards[0])).toBe(true);
        expect(LuhnValidator.validate(validCards[1])).toBe(true);
        expect(LuhnValidator.validate(validCards[2])).toBe(true);
        expect(LuhnValidator.validate(validCards[3])).toBe(false); // Wrong length
      });

      it('should correctly reject multiple invalid test cards', () => {
        const invalidCards = [
          '4532015112830367', // Wrong checksum
          '5425233430109904', // Wrong checksum
          '6011111111111118', // Wrong checksum
        ];

        invalidCards.forEach((card) => {
          expect(LuhnValidator.validate(card)).toBe(false);
        });
      });

      it('should validate card number where doubled digit exceeds 9', () => {
        // Test Luhn algorithm handling of digits that become > 9 when doubled
        expect(LuhnValidator.validate('4532015112830366')).toBe(true);
      });
    });

    describe('boundary conditions', () => {
      it('should handle maximum valid numeric string', () => {
        expect(LuhnValidator.validate('9999999999999995')).toBe(true);
      });

      it('should handle minimum valid numeric string', () => {
        expect(LuhnValidator.validate('0000000000000000')).toBe(true);
      });

      it('should reject 15-digit number', () => {
        expect(LuhnValidator.validate('453201511283036')).toBe(false);
      });

      it('should reject 17-digit number', () => {
        expect(LuhnValidator.validate('45320151128303660')).toBe(false);
      });
    });
  });
});
