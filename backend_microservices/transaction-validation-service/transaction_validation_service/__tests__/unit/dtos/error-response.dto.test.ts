import { ErrorCode } from '../../../src/dtos/error-response.dto';

describe('Error Response DTOs', () => {
  describe('ErrorCode', () => {
    it('should define VALIDATION_ERROR', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });

    it('should define INVALID_REQUEST', () => {
      expect(ErrorCode.INVALID_REQUEST).toBe('INVALID_REQUEST');
    });

    it('should define UNAUTHORIZED', () => {
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    });

    it('should define CARD_NOT_FOUND', () => {
      expect(ErrorCode.CARD_NOT_FOUND).toBe('CARD_NOT_FOUND');
    });

    it('should define DATABASE_ERROR', () => {
      expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
    });

    it('should define TIMEOUT_ERROR', () => {
      expect(ErrorCode.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    });

    it('should define INTERNAL_ERROR', () => {
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });

    it('should have unique values for all error codes', () => {
      const values = Object.values(ErrorCode);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
