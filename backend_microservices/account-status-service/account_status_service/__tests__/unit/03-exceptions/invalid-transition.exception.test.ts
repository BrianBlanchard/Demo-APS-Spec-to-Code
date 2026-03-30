import { InvalidTransitionException } from '../../../src/exceptions/invalid-transition.exception';
import { AccountStatus } from '../../../src/enums/account-status.enum';
import { BaseException } from '../../../src/exceptions/base.exception';

describe('InvalidTransitionException', () => {
  describe('Constructor', () => {
    it('should create exception with correct properties', () => {
      const accountId = '12345678901';
      const currentStatus = AccountStatus.INACTIVE;
      const newStatus = AccountStatus.ACTIVE;

      const exception = new InvalidTransitionException(accountId, currentStatus, newStatus);

      expect(exception).toBeInstanceOf(InvalidTransitionException);
      expect(exception).toBeInstanceOf(BaseException);
      expect(exception).toBeInstanceOf(Error);
    });

    it('should have correct status code 422', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.statusCode).toBe(422);
    });

    it('should have correct error code', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.errorCode).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should include account ID in message', () => {
      const accountId = '98765432109';
      const exception = new InvalidTransitionException(
        accountId,
        AccountStatus.INACTIVE,
        AccountStatus.SUSPENDED
      );

      expect(exception.message).toContain(accountId);
    });

    it('should include current status in message', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.message).toContain('inactive');
    });

    it('should include new status in message', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.message).toContain('active');
    });

    it('should have descriptive message format', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.message).toMatch(/Cannot transition from .* to .*/);
    });
  });

  describe('Error properties', () => {
    it('should have correct name property', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.name).toBe('InvalidTransitionException');
    });

    it('should have stack trace', () => {
      const exception = new InvalidTransitionException(
        '12345678901',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
    });
  });

  describe('Edge cases', () => {
    it('should handle all status combinations', () => {
      const statuses = [AccountStatus.ACTIVE, AccountStatus.SUSPENDED, AccountStatus.INACTIVE];

      statuses.forEach((current) => {
        statuses.forEach((newStat) => {
          const exception = new InvalidTransitionException('12345678901', current, newStat);
          expect(exception.message).toBeTruthy();
          expect(exception.statusCode).toBe(422);
        });
      });
    });

    it('should handle empty account ID', () => {
      const exception = new InvalidTransitionException(
        '',
        AccountStatus.INACTIVE,
        AccountStatus.ACTIVE
      );

      expect(exception.message).toBeDefined();
      expect(exception.statusCode).toBe(422);
    });
  });
});
