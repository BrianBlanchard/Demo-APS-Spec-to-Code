import { CloseCycleRequestSchema } from '../../src/types/validation.schemas';
import { ZodError } from 'zod';

describe('Validation Schemas', () => {
  describe('CloseCycleRequestSchema', () => {
    it('should validate correct request with valid dates', () => {
      const validRequest = {
        billingCycleEnd: '2024-01-31',
        processingDate: '2024-02-01',
      };

      const result = CloseCycleRequestSchema.parse(validRequest);
      expect(result).toEqual(validRequest);
    });

    it('should accept leap year dates', () => {
      const validRequest = {
        billingCycleEnd: '2024-02-29',
        processingDate: '2024-03-01',
      };

      const result = CloseCycleRequestSchema.parse(validRequest);
      expect(result).toEqual(validRequest);
    });

    it('should reject invalid billingCycleEnd format', () => {
      const invalidRequest = {
        billingCycleEnd: '01/31/2024',
        processingDate: '2024-02-01',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject invalid processingDate format', () => {
      const invalidRequest = {
        billingCycleEnd: '2024-01-31',
        processingDate: 'Feb 1, 2024',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject missing billingCycleEnd', () => {
      const invalidRequest = {
        processingDate: '2024-02-01',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject missing processingDate', () => {
      const invalidRequest = {
        billingCycleEnd: '2024-01-31',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject empty object', () => {
      expect(() => CloseCycleRequestSchema.parse({})).toThrow(ZodError);
    });

    it('should reject date with wrong separator', () => {
      const invalidRequest = {
        billingCycleEnd: '2024/01/31',
        processingDate: '2024-02-01',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject partial date', () => {
      const invalidRequest = {
        billingCycleEnd: '2024-01',
        processingDate: '2024-02-01',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject date with time component', () => {
      const invalidRequest = {
        billingCycleEnd: '2024-01-31T00:00:00',
        processingDate: '2024-02-01',
      };

      expect(() => CloseCycleRequestSchema.parse(invalidRequest)).toThrow(ZodError);
    });
  });
});
