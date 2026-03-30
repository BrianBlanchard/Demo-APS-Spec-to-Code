import {
  AccountStatus,
  VALID_STATUS_TRANSITIONS,
  isValidTransition,
} from '../../../src/enums/account-status.enum';

describe('AccountStatus Enum', () => {
  describe('Enum values', () => {
    it('should have ACTIVE status', () => {
      expect(AccountStatus.ACTIVE).toBe('active');
    });

    it('should have SUSPENDED status', () => {
      expect(AccountStatus.SUSPENDED).toBe('suspended');
    });

    it('should have INACTIVE status', () => {
      expect(AccountStatus.INACTIVE).toBe('inactive');
    });

    it('should have exactly 3 status values', () => {
      expect(Object.values(AccountStatus)).toHaveLength(3);
    });
  });

  describe('Valid status transitions', () => {
    it('should allow active to suspended transition', () => {
      expect(isValidTransition(AccountStatus.ACTIVE, AccountStatus.SUSPENDED)).toBe(true);
    });

    it('should allow active to inactive transition', () => {
      expect(isValidTransition(AccountStatus.ACTIVE, AccountStatus.INACTIVE)).toBe(true);
    });

    it('should allow suspended to active transition', () => {
      expect(isValidTransition(AccountStatus.SUSPENDED, AccountStatus.ACTIVE)).toBe(true);
    });

    it('should allow suspended to inactive transition', () => {
      expect(isValidTransition(AccountStatus.SUSPENDED, AccountStatus.INACTIVE)).toBe(true);
    });

    it('should have correct transitions for ACTIVE status', () => {
      expect(VALID_STATUS_TRANSITIONS[AccountStatus.ACTIVE]).toEqual([
        AccountStatus.SUSPENDED,
        AccountStatus.INACTIVE,
      ]);
    });

    it('should have correct transitions for SUSPENDED status', () => {
      expect(VALID_STATUS_TRANSITIONS[AccountStatus.SUSPENDED]).toEqual([
        AccountStatus.ACTIVE,
        AccountStatus.INACTIVE,
      ]);
    });

    it('should have empty transitions for INACTIVE status', () => {
      expect(VALID_STATUS_TRANSITIONS[AccountStatus.INACTIVE]).toEqual([]);
    });
  });

  describe('Invalid status transitions', () => {
    it('should not allow inactive to active transition', () => {
      expect(isValidTransition(AccountStatus.INACTIVE, AccountStatus.ACTIVE)).toBe(false);
    });

    it('should not allow inactive to suspended transition', () => {
      expect(isValidTransition(AccountStatus.INACTIVE, AccountStatus.SUSPENDED)).toBe(false);
    });

    it('should not allow same status transition for ACTIVE', () => {
      expect(isValidTransition(AccountStatus.ACTIVE, AccountStatus.ACTIVE)).toBe(false);
    });

    it('should not allow same status transition for SUSPENDED', () => {
      expect(isValidTransition(AccountStatus.SUSPENDED, AccountStatus.SUSPENDED)).toBe(false);
    });

    it('should not allow same status transition for INACTIVE', () => {
      expect(isValidTransition(AccountStatus.INACTIVE, AccountStatus.INACTIVE)).toBe(false);
    });
  });

  describe('Transition matrix completeness', () => {
    it('should have transition rules for all status values', () => {
      Object.values(AccountStatus).forEach((status) => {
        expect(VALID_STATUS_TRANSITIONS[status]).toBeDefined();
        expect(Array.isArray(VALID_STATUS_TRANSITIONS[status])).toBe(true);
      });
    });

    it('should only contain valid statuses in transition arrays', () => {
      Object.values(VALID_STATUS_TRANSITIONS).forEach((transitions) => {
        transitions.forEach((targetStatus) => {
          expect(Object.values(AccountStatus)).toContain(targetStatus);
        });
      });
    });
  });
});
