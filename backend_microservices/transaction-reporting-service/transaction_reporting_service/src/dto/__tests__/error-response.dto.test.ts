import { describe, it, expect } from '@jest/globals';
import { ErrorResponseSchema } from '../error-response.dto';

describe('ErrorResponseDto', () => {
  const validError = {
    errorCode: 'VALIDATION_ERROR',
    message: 'Start date must be before or equal to end date',
    timestamp: '2024-01-15T10:30:00Z',
    traceId: '1705320000000-ABC12345',
  };

  describe('valid error responses', () => {
    it('should accept valid error response', () => {
      expect(() => ErrorResponseSchema.parse(validError)).not.toThrow();
    });

    it('should accept different error codes', () => {
      const errorCodes = [
        'VALIDATION_ERROR',
        'NOT_FOUND',
        'DATABASE_ERROR',
        'REPORT_GENERATION_ERROR',
        'INTERNAL_SERVER_ERROR',
      ];
      errorCodes.forEach((errorCode) => {
        const error = { ...validError, errorCode };
        expect(() => ErrorResponseSchema.parse(error)).not.toThrow();
      });
    });
  });

  describe('field validation', () => {
    it('should reject missing errorCode', () => {
      const { errorCode, ...missing } = validError;
      expect(() => ErrorResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing message', () => {
      const { message, ...missing } = validError;
      expect(() => ErrorResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing timestamp', () => {
      const { timestamp, ...missing } = validError;
      expect(() => ErrorResponseSchema.parse(missing)).toThrow();
    });

    it('should reject missing traceId', () => {
      const { traceId, ...missing } = validError;
      expect(() => ErrorResponseSchema.parse(missing)).toThrow();
    });

    it('should reject empty errorCode', () => {
      const error = { ...validError, errorCode: '' };
      expect(() => ErrorResponseSchema.parse(error)).toThrow();
    });

    it('should reject empty message', () => {
      const error = { ...validError, message: '' };
      expect(() => ErrorResponseSchema.parse(error)).toThrow();
    });

    it('should reject invalid timestamp format', () => {
      const error = { ...validError, timestamp: '2024-01-15' };
      expect(() => ErrorResponseSchema.parse(error)).toThrow();
    });

    it('should accept various traceId formats', () => {
      const traceIds = [
        '1705320000000-ABC12345',
        'trace-123',
        'abc-def-ghi',
        '123456789',
      ];
      traceIds.forEach((traceId) => {
        const error = { ...validError, traceId };
        expect(() => ErrorResponseSchema.parse(error)).not.toThrow();
      });
    });
  });
});
