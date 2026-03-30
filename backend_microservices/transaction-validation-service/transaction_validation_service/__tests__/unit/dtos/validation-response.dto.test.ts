import {
  DeclineReasonDescriptions,
} from '../../../src/dtos/validation-response.dto';
import { DeclineReason } from '../../../src/models/validation.model';

describe('Validation Response DTOs', () => {
  describe('DeclineReasonDescriptions', () => {
    it('should have description for insufficient_credit', () => {
      expect(DeclineReasonDescriptions[DeclineReason.INSUFFICIENT_CREDIT]).toBe(
        'Transaction amount exceeds available credit'
      );
    });

    it('should have description for card_inactive', () => {
      expect(DeclineReasonDescriptions[DeclineReason.CARD_INACTIVE]).toBe(
        'Card is suspended or cancelled'
      );
    });

    it('should have description for account_inactive', () => {
      expect(DeclineReasonDescriptions[DeclineReason.ACCOUNT_INACTIVE]).toBe(
        'Account is closed or suspended'
      );
    });

    it('should have description for invalid_cvv', () => {
      expect(DeclineReasonDescriptions[DeclineReason.INVALID_CVV]).toBe(
        'CVV does not match'
      );
    });

    it('should have description for duplicate_transaction', () => {
      expect(DeclineReasonDescriptions[DeclineReason.DUPLICATE_TRANSACTION]).toBe(
        'Possible duplicate transaction detected'
      );
    });

    it('should have description for daily_limit_exceeded', () => {
      expect(DeclineReasonDescriptions[DeclineReason.DAILY_LIMIT_EXCEEDED]).toBe(
        'Daily transaction limit reached'
      );
    });

    it('should have description for invalid_card', () => {
      expect(DeclineReasonDescriptions[DeclineReason.INVALID_CARD]).toBe(
        'Card number is invalid or not found'
      );
    });

    it('should have description for expired_card', () => {
      expect(DeclineReasonDescriptions[DeclineReason.EXPIRED_CARD]).toBe(
        'Card is past expiration date'
      );
    });

    it('should have descriptions for all decline reasons', () => {
      const allReasons = Object.values(DeclineReason);
      allReasons.forEach((reason) => {
        expect(DeclineReasonDescriptions[reason]).toBeDefined();
        expect(typeof DeclineReasonDescriptions[reason]).toBe('string');
        expect(DeclineReasonDescriptions[reason].length).toBeGreaterThan(0);
      });
    });
  });
});
