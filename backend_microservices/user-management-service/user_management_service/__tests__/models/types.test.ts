import {
  UserStatus,
  SuspensionReason,
  AdminAction,
  User,
  AdminAuditLog,
  RequestContext,
} from '../../src/models/types';

describe('Types - Enums', () => {
  describe('UserStatus', () => {
    it('should have correct enum values', () => {
      expect(UserStatus.ACTIVE).toBe('active');
      expect(UserStatus.SUSPENDED).toBe('suspended');
      expect(UserStatus.DELETED).toBe('deleted');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(UserStatus);
      expect(values).toHaveLength(3);
    });

    it('should be usable in comparisons', () => {
      const getStatus = (): UserStatus => UserStatus.ACTIVE;
      const status = getStatus();
      expect(status === UserStatus.ACTIVE).toBe(true);
      expect(status !== UserStatus.SUSPENDED).toBe(true);
      expect(status !== UserStatus.DELETED).toBe(true);
    });
  });

  describe('SuspensionReason', () => {
    it('should have correct enum values', () => {
      expect(SuspensionReason.FRAUD).toBe('fraud');
      expect(SuspensionReason.POLICY_VIOLATION).toBe('policy_violation');
      expect(SuspensionReason.SPAM).toBe('spam');
      expect(SuspensionReason.INAPPROPRIATE_CONTENT).toBe('inappropriate_content');
      expect(SuspensionReason.SECURITY_CONCERN).toBe('security_concern');
      expect(SuspensionReason.OTHER).toBe('other');
    });

    it('should have exactly 6 values', () => {
      const values = Object.values(SuspensionReason);
      expect(values).toHaveLength(6);
    });

    it('should be usable in switch statements', () => {
      const testSwitchStatement = (reason: SuspensionReason): string => {
        switch (reason) {
          case SuspensionReason.FRAUD:
            return 'fraud detected';
          case SuspensionReason.SPAM:
            return 'spam detected';
          default:
            return 'other';
        }
      };

      expect(testSwitchStatement(SuspensionReason.FRAUD)).toBe('fraud detected');
      expect(testSwitchStatement(SuspensionReason.SPAM)).toBe('spam detected');
      expect(testSwitchStatement(SuspensionReason.OTHER)).toBe('other');
    });
  });

  describe('AdminAction', () => {
    it('should have correct enum values', () => {
      expect(AdminAction.SUSPEND_USER).toBe('suspend_user');
      expect(AdminAction.REACTIVATE_USER).toBe('reactivate_user');
      expect(AdminAction.DELETE_USER).toBe('delete_user');
      expect(AdminAction.CHANGE_ROLE).toBe('change_role');
      expect(AdminAction.IMPERSONATE_USER).toBe('impersonate_user');
      expect(AdminAction.BULK_IMPORT).toBe('bulk_import');
      expect(AdminAction.BULK_EXPORT).toBe('bulk_export');
    });

    it('should have exactly 7 values', () => {
      const values = Object.values(AdminAction);
      expect(values).toHaveLength(7);
    });
  });
});

describe('Types - Interfaces', () => {
  describe('User', () => {
    it('should accept valid User with all fields', () => {
      const user: User = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        suspension_reason: null,
        suspension_notes: null,
        suspension_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(user.user_id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should accept suspended User with suspension details', () => {
      const suspensionDate = new Date('2024-02-15T10:30:00Z');
      const user: User = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'suspended@example.com',
        status: UserStatus.SUSPENDED,
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Fraudulent activity detected',
        suspension_expires_at: suspensionDate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(user.status).toBe(UserStatus.SUSPENDED);
      expect(user.suspension_reason).toBe(SuspensionReason.FRAUD);
      expect(user.suspension_expires_at).toEqual(suspensionDate);
    });

    it('should accept deleted User', () => {
      const user: User = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'deleted@example.com',
        status: UserStatus.DELETED,
        suspension_reason: null,
        suspension_notes: null,
        suspension_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(user.status).toBe(UserStatus.DELETED);
    });
  });

  describe('AdminAuditLog', () => {
    it('should accept valid AdminAuditLog with all fields', () => {
      const auditLog: AdminAuditLog = {
        log_id: 1,
        admin_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        action: AdminAction.SUSPEND_USER,
        target_user_id: '123e4567-e89b-12d3-a456-426614174000',
        details_json: {
          suspension_reason: 'fraud',
          duration_days: 30,
        },
        ip_address: '192.168.1.1',
        created_at: new Date(),
      };

      expect(auditLog.log_id).toBe(1);
      expect(auditLog.action).toBe(AdminAction.SUSPEND_USER);
      expect(auditLog.details_json).toBeDefined();
    });

    it('should accept AdminAuditLog with null optional fields', () => {
      const auditLog: AdminAuditLog = {
        log_id: 2,
        admin_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        action: AdminAction.BULK_EXPORT,
        target_user_id: null,
        details_json: null,
        ip_address: '10.0.0.1',
        created_at: new Date(),
      };

      expect(auditLog.target_user_id).toBeNull();
      expect(auditLog.details_json).toBeNull();
    });

    it('should accept AdminAuditLog with complex details_json', () => {
      const auditLog: AdminAuditLog = {
        log_id: 3,
        admin_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        action: AdminAction.IMPERSONATE_USER,
        target_user_id: '123e4567-e89b-12d3-a456-426614174000',
        details_json: {
          reason: 'customer support',
          ticket_id: 'TICKET-123',
          duration_minutes: 15,
          actions_performed: ['view_profile', 'check_orders'],
        },
        ip_address: '172.16.0.1',
        created_at: new Date(),
      };

      expect(auditLog.details_json).toHaveProperty('reason');
      expect(auditLog.details_json).toHaveProperty('actions_performed');
    });
  });

  describe('RequestContext', () => {
    it('should accept valid RequestContext with all fields', () => {
      const context: RequestContext = {
        traceId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        adminId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      };

      expect(context.traceId).toBeDefined();
      expect(context.adminId).toBeDefined();
    });

    it('should accept RequestContext without optional adminId', () => {
      const context: RequestContext = {
        traceId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
      };

      expect(context.adminId).toBeUndefined();
    });

    it('should accept RequestContext with various IP formats', () => {
      const ipAddresses = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '::1',
      ];

      ipAddresses.forEach((ip) => {
        const context: RequestContext = {
          traceId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          timestamp: new Date(),
          ipAddress: ip,
        };

        expect(context.ipAddress).toBe(ip);
      });
    });
  });
});

describe('Types - Type Safety', () => {
  it('should enforce type safety for User status', () => {
    const user: User = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      status: UserStatus.ACTIVE,
      suspension_reason: null,
      suspension_notes: null,
      suspension_expires_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // TypeScript should enforce enum type
    expect([UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.DELETED]).toContain(user.status);
  });

  it('should enforce type safety for AdminAction', () => {
    const validActions = [
      AdminAction.SUSPEND_USER,
      AdminAction.REACTIVATE_USER,
      AdminAction.DELETE_USER,
      AdminAction.CHANGE_ROLE,
      AdminAction.IMPERSONATE_USER,
      AdminAction.BULK_IMPORT,
      AdminAction.BULK_EXPORT,
    ];

    validActions.forEach((action) => {
      const auditLog: AdminAuditLog = {
        log_id: 1,
        admin_id: 'admin-id',
        action: action,
        target_user_id: null,
        details_json: null,
        ip_address: '127.0.0.1',
        created_at: new Date(),
      };

      expect(auditLog.action).toBe(action);
    });
  });
});
