import { FeeAssessmentRequestSchema } from '../fee-assessment-request.dto';
import { FeeType } from '../../types/fee-types';

describe('FeeAssessmentRequestSchema', () => {
  describe('Valid Input', () => {
    it('should validate a valid late payment fee request', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Payment past due date',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result).toEqual(input);
    });

    it('should validate a valid annual fee request', () => {
      const input = {
        accountId: '98765432109',
        feeType: FeeType.ANNUAL_FEE,
        amount: 95.0,
        reason: 'Annual account maintenance',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result).toEqual(input);
    });

    it('should validate all valid fee types', () => {
      const feeTypes = [
        FeeType.LATE_PAYMENT,
        FeeType.ANNUAL_FEE,
        FeeType.OVER_LIMIT,
        FeeType.CASH_ADVANCE,
        FeeType.RETURNED_PAYMENT,
      ];

      feeTypes.forEach((feeType) => {
        const input = {
          accountId: '12345678901',
          feeType,
          amount: 25.0,
          reason: 'Test reason',
        };

        expect(() => FeeAssessmentRequestSchema.parse(input)).not.toThrow();
      });
    });

    it('should validate amount with 2 decimal places', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.99,
        reason: 'Test',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result.amount).toBe(35.99);
    });

    it('should validate amount with 1 decimal place', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.5,
        reason: 'Test',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result.amount).toBe(35.5);
    });

    it('should validate amount with no decimal places', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35,
        reason: 'Test',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result.amount).toBe(35);
    });

    it('should trim whitespace from reason', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: '  Payment past due date  ',
      };

      const result = FeeAssessmentRequestSchema.parse(input);

      expect(result.reason).toBe('Payment past due date');
    });
  });

  describe('Invalid Account ID', () => {
    it('should reject account ID with less than 11 digits', () => {
      const input = {
        accountId: '1234567890',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject account ID with more than 11 digits', () => {
      const input = {
        accountId: '123456789012',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject account ID with non-numeric characters', () => {
      const input = {
        accountId: '1234567890A',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject account ID with special characters', () => {
      const input = {
        accountId: '12345678-01',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject empty account ID', () => {
      const input = {
        accountId: '',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });
  });

  describe('Invalid Fee Type', () => {
    it('should reject invalid fee type', () => {
      const input = {
        accountId: '12345678901',
        feeType: 'invalid_fee',
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject numeric fee type', () => {
      const input = {
        accountId: '12345678901',
        feeType: 123,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject null fee type', () => {
      const input = {
        accountId: '12345678901',
        feeType: null,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });
  });

  describe('Invalid Amount', () => {
    it('should reject zero amount', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject negative amount', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: -35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject amount with more than 2 decimal places', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.999,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject string amount', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: '35.00',
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });
  });

  describe('Invalid Reason', () => {
    it('should reject empty reason', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: '',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject whitespace-only reason after trimming', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: '   ',
      };

      // Whitespace is trimmed, making it empty, which should be rejected
      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject missing accountId', () => {
      const input = {
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject missing feeType', () => {
      const input = {
        accountId: '12345678901',
        amount: 35.0,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject missing amount', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        reason: 'Test',
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });

    it('should reject missing reason', () => {
      const input = {
        accountId: '12345678901',
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
      };

      expect(() => FeeAssessmentRequestSchema.parse(input)).toThrow();
    });
  });
});
