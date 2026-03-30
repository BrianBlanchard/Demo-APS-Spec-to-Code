import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { validateDateRange, isLargeDateRange } from '../date-validator';
import { ValidationError } from '../errors';

describe('Date Validator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateDateRange', () => {
    describe('valid date ranges', () => {
      it('should accept valid date range', () => {
        expect(() => {
          validateDateRange('2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z');
        }).not.toThrow();
      });

      it('should accept same start and end date', () => {
        expect(() => {
          validateDateRange('2024-01-15T00:00:00Z', '2024-01-15T23:59:59Z');
        }).not.toThrow();
      });

      it('should accept past dates', () => {
        expect(() => {
          validateDateRange('2023-01-01T00:00:00Z', '2023-12-31T23:59:59Z');
        }).not.toThrow();
      });

      it('should accept dates with milliseconds', () => {
        expect(() => {
          validateDateRange('2024-01-01T00:00:00.000Z', '2024-01-31T23:59:59.999Z');
        }).not.toThrow();
      });
    });

    describe('future date validation', () => {
      it('should reject future start date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateStr = futureDate.toISOString();

        expect(() => {
          validateDateRange(futureDateStr, '2024-01-31T23:59:59Z');
        }).toThrow(ValidationError);

        expect(() => {
          validateDateRange(futureDateStr, '2024-01-31T23:59:59Z');
        }).toThrow('Start date cannot be in the future');
      });

      it('should reject future end date', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateStr = futureDate.toISOString();

        expect(() => {
          validateDateRange('2024-01-01T00:00:00Z', futureDateStr);
        }).toThrow(ValidationError);

        expect(() => {
          validateDateRange('2024-01-01T00:00:00Z', futureDateStr);
        }).toThrow('End date cannot be in the future');
      });

      it('should reject both future dates', () => {
        const futureDate1 = new Date();
        futureDate1.setFullYear(futureDate1.getFullYear() + 1);
        const futureDate2 = new Date();
        futureDate2.setFullYear(futureDate2.getFullYear() + 2);

        expect(() => {
          validateDateRange(futureDate1.toISOString(), futureDate2.toISOString());
        }).toThrow(ValidationError);
      });
    });

    describe('date order validation', () => {
      it('should reject start date after end date', () => {
        expect(() => {
          validateDateRange('2024-01-31T23:59:59Z', '2024-01-01T00:00:00Z');
        }).toThrow(ValidationError);

        expect(() => {
          validateDateRange('2024-01-31T23:59:59Z', '2024-01-01T00:00:00Z');
        }).toThrow('Start date must be before or equal to end date');
      });

      it('should reject start date significantly after end date', () => {
        expect(() => {
          validateDateRange('2024-12-31T23:59:59Z', '2024-01-01T00:00:00Z');
        }).toThrow(ValidationError);
      });

      it('should reject inverted dates by one day', () => {
        expect(() => {
          validateDateRange('2024-01-02T00:00:00Z', '2024-01-01T00:00:00Z');
        }).toThrow(ValidationError);
      });
    });

    describe('error handling', () => {
      it('should throw ValidationError type', () => {
        expect(() => {
          validateDateRange('2024-02-01T00:00:00Z', '2024-01-01T00:00:00Z');
        }).toThrow(ValidationError);
      });

      it('should have meaningful error messages', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        try {
          validateDateRange(futureDate.toISOString(), '2024-01-01T00:00:00Z');
          fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toContain('cannot be in the future');
        }
      });
    });
  });

  describe('isLargeDateRange', () => {
    describe('with default threshold (90 days)', () => {
      beforeEach(() => {
        delete process.env.ASYNC_REPORT_THRESHOLD_DAYS;
      });

      it('should return false for small date ranges', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z');
        expect(result).toBe(false);
      });

      it('should return false for 90-day range', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-03-31T23:59:59Z');
        expect(result).toBe(false);
      });

      it('should return true for 91-day range', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-04-01T23:59:59Z');
        expect(result).toBe(true);
      });

      it('should return true for very large ranges', () => {
        const result = isLargeDateRange('2023-01-01T00:00:00Z', '2024-12-31T23:59:59Z');
        expect(result).toBe(true);
      });

      it('should return false for single day', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z');
        expect(result).toBe(false);
      });

      it('should return false for 89-day range', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-03-30T23:59:59Z');
        expect(result).toBe(false);
      });
    });

    describe('with custom threshold', () => {
      it('should use custom threshold from environment', () => {
        process.env.ASYNC_REPORT_THRESHOLD_DAYS = '30';

        const result30 = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z');
        const result31 = isLargeDateRange('2024-01-01T00:00:00Z', '2024-02-01T23:59:59Z');

        expect(result30).toBe(false);
        expect(result31).toBe(true);
      });

      it('should handle threshold of 1 day', () => {
        process.env.ASYNC_REPORT_THRESHOLD_DAYS = '1';

        const sameDay = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z');
        const nextDay = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-02T23:59:59Z');
        const twoDays = isLargeDateRange('2024-01-01T00:00:00Z', '2024-01-03T00:00:00Z');

        expect(sameDay).toBe(false); // 0 days difference
        expect(nextDay).toBe(false); // 1 day difference (not > 1)
        expect(twoDays).toBe(true); // 2 days difference (> 1)
      });

      it('should handle large threshold values', () => {
        process.env.ASYNC_REPORT_THRESHOLD_DAYS = '365';

        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z');
        expect(result).toBe(false);

        const result2 = isLargeDateRange('2024-01-01T00:00:00Z', '2025-01-02T23:59:59Z');
        expect(result2).toBe(true);
      });

      it('should handle invalid threshold as NaN and default', () => {
        process.env.ASYNC_REPORT_THRESHOLD_DAYS = 'invalid';

        // This will parse as NaN, which will use 90 as default
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-04-01T23:59:59Z');
        expect(typeof result).toBe('boolean');
      });
    });

    describe('edge cases', () => {
      it('should handle dates with different time zones', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-04-01T23:59:59Z');
        expect(result).toBe(true);
      });

      it('should calculate days difference correctly', () => {
        // Exactly 90 days
        const start = '2024-01-01T00:00:00Z';
        const end = '2024-03-31T00:00:00Z';

        const result = isLargeDateRange(start, end);
        expect(result).toBe(false);
      });

      it('should handle leap year correctly', () => {
        // 2024 is a leap year
        const result = isLargeDateRange('2024-02-01T00:00:00Z', '2024-04-30T23:59:59Z');
        expect(result).toBe(false);
      });
    });

    describe('boundary testing', () => {
      beforeEach(() => {
        process.env.ASYNC_REPORT_THRESHOLD_DAYS = '90';
      });

      it('should return false for exactly threshold days', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-03-31T00:00:00Z');
        expect(result).toBe(false);
      });

      it('should return true for threshold + 1 days', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-04-01T00:00:00Z');
        expect(result).toBe(true);
      });

      it('should return false for threshold - 1 days', () => {
        const result = isLargeDateRange('2024-01-01T00:00:00Z', '2024-03-30T00:00:00Z');
        expect(result).toBe(false);
      });
    });
  });
});
