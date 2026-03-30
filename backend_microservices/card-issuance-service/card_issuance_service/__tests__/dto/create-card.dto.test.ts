import { CreateCardSchema } from '../../src/dto/create-card.dto';

describe('CreateCardSchema', () => {
  describe('cardNumber validation', () => {
    it('should accept valid 16-digit card number', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.cardNumber).toBe('1234567890123456');
    });

    it('should reject card number shorter than 16 digits', () => {
      const data = {
        cardNumber: '123456789012345',
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Card number must be exactly 16 digits');
    });

    it('should reject card number longer than 16 digits', () => {
      const data = {
        cardNumber: '12345678901234567',
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Card number must be exactly 16 digits');
    });

    it('should reject card number with non-numeric characters', () => {
      const data = {
        cardNumber: '123456789012345a',
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Card number must contain only digits');
    });

    it('should reject card number with spaces', () => {
      const data = {
        cardNumber: '1234 5678 9012 3456',
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject card number with special characters', () => {
      const data = {
        cardNumber: '1234-5678-9012-3456',
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });
  });

  describe('accountId validation', () => {
    it('should accept valid 11-digit account ID', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.accountId).toBe('12345678901');
    });

    it('should reject account ID shorter than 11 digits', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '1234567890',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Account ID must be exactly 11 digits');
    });

    it('should reject account ID longer than 11 digits', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '123456789012',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Account ID must be exactly 11 digits');
    });

    it('should reject account ID with non-numeric characters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '1234567890a',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Account ID must contain only digits');
    });
  });

  describe('embossedName validation', () => {
    it('should accept valid embossed name with uppercase letters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'JOHN SMITH',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBe('JOHN SMITH');
    });

    it('should accept embossed name with numbers', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'JOHN SMITH 2ND',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBe('JOHN SMITH 2ND');
    });

    it('should accept embossed name with hyphens', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'MARY-JANE WATSON',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBe('MARY-JANE WATSON');
    });

    it('should reject embossed name exceeding 26 characters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow('Embossed name exceeds 26 character limit');
    });

    it('should accept embossed name exactly 26 characters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should reject embossed name with lowercase letters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'John Smith',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject embossed name with special characters', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: 'JOHN@SMITH',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should allow optional embossed name', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBeUndefined();
    });

    it('should accept empty string for embossed name', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        embossedName: '',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.embossedName).toBe('');
    });
  });

  describe('expirationYears validation', () => {
    it('should accept valid expiration years within range', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 3,
      };
      const result = CreateCardSchema.parse(data);
      expect(result.expirationYears).toBe(3);
    });

    it('should accept minimum expiration years (1)', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 1,
      };
      const result = CreateCardSchema.parse(data);
      expect(result.expirationYears).toBe(1);
    });

    it('should accept maximum expiration years (5)', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 5,
      };
      const result = CreateCardSchema.parse(data);
      expect(result.expirationYears).toBe(5);
    });

    it('should reject expiration years below minimum', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 0,
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject expiration years above maximum', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 6,
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject non-integer expiration years', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
        expirationYears: 3.5,
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should default to 3 years when not provided', () => {
      const data = {
        cardNumber: '1234567890123456',
        accountId: '12345678901',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.expirationYears).toBe(3);
    });
  });

  describe('complete validation scenarios', () => {
    it('should accept complete valid request with all fields', () => {
      const data = {
        cardNumber: '4532015112830366',
        accountId: '12345678901',
        embossedName: 'JOHN SMITH',
        expirationYears: 5,
      };
      const result = CreateCardSchema.parse(data);
      expect(result).toEqual(data);
    });

    it('should accept minimal valid request', () => {
      const data = {
        cardNumber: '4532015112830366',
        accountId: '12345678901',
      };
      const result = CreateCardSchema.parse(data);
      expect(result.cardNumber).toBe('4532015112830366');
      expect(result.accountId).toBe('12345678901');
      expect(result.expirationYears).toBe(3);
    });

    it('should reject request missing cardNumber', () => {
      const data = {
        accountId: '12345678901',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject request missing accountId', () => {
      const data = {
        cardNumber: '4532015112830366',
      };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it('should reject completely empty request', () => {
      expect(() => CreateCardSchema.parse({})).toThrow();
    });
  });
});
