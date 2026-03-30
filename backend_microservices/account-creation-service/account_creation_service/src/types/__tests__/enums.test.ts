import {
  AccountStatus,
  AccountType,
  KycStatus,
  AuditAction,
  AuditEntityType,
} from '../enums';

describe('Enums', () => {
  describe('AccountStatus', () => {
    it('should have NEW status', () => {
      expect(AccountStatus.NEW).toBe('NEW');
    });

    it('should have ACTIVE status', () => {
      expect(AccountStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have CLOSED status', () => {
      expect(AccountStatus.CLOSED).toBe('CLOSED');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toHaveLength(3);
    });
  });

  describe('AccountType', () => {
    it('should have STANDARD_CREDIT type', () => {
      expect(AccountType.STANDARD_CREDIT).toBe('STANDARD_CREDIT');
    });

    it('should have PREMIUM_CREDIT type', () => {
      expect(AccountType.PREMIUM_CREDIT).toBe('PREMIUM_CREDIT');
    });

    it('should have PROMOTIONAL_6MONTH type', () => {
      expect(AccountType.PROMOTIONAL_6MONTH).toBe('PROMOTIONAL_6MONTH');
    });

    it('should have exactly 3 account types', () => {
      const types = Object.values(AccountType);
      expect(types).toHaveLength(3);
    });
  });

  describe('KycStatus', () => {
    it('should have PENDING status', () => {
      expect(KycStatus.PENDING).toBe('PENDING');
    });

    it('should have VERIFIED status', () => {
      expect(KycStatus.VERIFIED).toBe('VERIFIED');
    });

    it('should have REJECTED status', () => {
      expect(KycStatus.REJECTED).toBe('REJECTED');
    });
  });

  describe('AuditAction', () => {
    it('should have CREATE action', () => {
      expect(AuditAction.CREATE).toBe('CREATE');
    });

    it('should have UPDATE action', () => {
      expect(AuditAction.UPDATE).toBe('UPDATE');
    });

    it('should have DELETE action', () => {
      expect(AuditAction.DELETE).toBe('DELETE');
    });
  });

  describe('AuditEntityType', () => {
    it('should have ACCOUNT entity type', () => {
      expect(AuditEntityType.ACCOUNT).toBe('ACCOUNT');
    });

    it('should have CUSTOMER entity type', () => {
      expect(AuditEntityType.CUSTOMER).toBe('CUSTOMER');
    });
  });
});
