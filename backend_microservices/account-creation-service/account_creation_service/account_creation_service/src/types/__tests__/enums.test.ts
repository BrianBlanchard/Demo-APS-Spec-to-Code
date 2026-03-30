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

    it('should be usable in comparisons', () => {
      const status: AccountStatus = AccountStatus.NEW;
      expect(status === AccountStatus.NEW).toBe(true);
      expect(status === AccountStatus.ACTIVE).toBe(false);
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

    it('should be usable in switch statements', () => {
      const type: AccountType = AccountType.STANDARD_CREDIT;
      let result = '';

      switch (type) {
        case AccountType.STANDARD_CREDIT:
          result = 'standard';
          break;
        case AccountType.PREMIUM_CREDIT:
          result = 'premium';
          break;
        case AccountType.PROMOTIONAL_6MONTH:
          result = 'promotional';
          break;
      }

      expect(result).toBe('standard');
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

    it('should have exactly 3 KYC statuses', () => {
      const statuses = Object.values(KycStatus);
      expect(statuses).toHaveLength(3);
    });

    it('should be usable for KYC validation', () => {
      const kycStatus: KycStatus = KycStatus.VERIFIED;
      const isVerified = kycStatus === KycStatus.VERIFIED;
      expect(isVerified).toBe(true);
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

    it('should have exactly 3 audit actions', () => {
      const actions = Object.values(AuditAction);
      expect(actions).toHaveLength(3);
    });

    it('should be usable for audit logging', () => {
      const action: AuditAction = AuditAction.CREATE;
      expect(action).toBe('CREATE');
    });
  });

  describe('AuditEntityType', () => {
    it('should have ACCOUNT entity type', () => {
      expect(AuditEntityType.ACCOUNT).toBe('ACCOUNT');
    });

    it('should have CUSTOMER entity type', () => {
      expect(AuditEntityType.CUSTOMER).toBe('CUSTOMER');
    });

    it('should have exactly 2 entity types', () => {
      const types = Object.values(AuditEntityType);
      expect(types).toHaveLength(2);
    });

    it('should be usable for audit trail classification', () => {
      const entityType: AuditEntityType = AuditEntityType.ACCOUNT;
      expect(entityType).toBe('ACCOUNT');
    });
  });

  describe('Enum type safety', () => {
    it('should enforce type safety for AccountStatus', () => {
      const status: AccountStatus = AccountStatus.NEW;
      expect(typeof status).toBe('string');
    });

    it('should enforce type safety for AccountType', () => {
      const type: AccountType = AccountType.STANDARD_CREDIT;
      expect(typeof type).toBe('string');
    });

    it('should enforce type safety for KycStatus', () => {
      const status: KycStatus = KycStatus.VERIFIED;
      expect(typeof status).toBe('string');
    });

    it('should enforce type safety for AuditAction', () => {
      const action: AuditAction = AuditAction.CREATE;
      expect(typeof action).toBe('string');
    });

    it('should enforce type safety for AuditEntityType', () => {
      const type: AuditEntityType = AuditEntityType.ACCOUNT;
      expect(typeof type).toBe('string');
    });
  });
});
