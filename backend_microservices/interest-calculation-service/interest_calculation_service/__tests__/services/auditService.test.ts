import { AuditService, AuditEntry } from '../../src/services/auditService';

// Mock logger to capture log calls
class MockLogger {
  private logs: Array<{ level: string; data: Record<string, unknown>; message: string }> = [];

  info(data: Record<string, unknown>, message: string): void {
    this.logs.push({ level: 'info', data, message });
  }

  getLogs(): Array<{ level: string; data: Record<string, unknown>; message: string }> {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLastLog(): { level: string; data: Record<string, unknown>; message: string } | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }
}

// Store original logger and replace with mock
let mockLogger: MockLogger;
let originalLogger: unknown;

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
    mockLogger = new MockLogger();

    // Replace the logger module's logger with our mock
    originalLogger = require('../../src/config/logger').logger;
    require('../../src/config/logger').logger = mockLogger;
  });

  afterEach(() => {
    // Restore original logger
    require('../../src/config/logger').logger = originalLogger;
  });

  describe('logAudit', () => {
    describe('basic logging', () => {
      it('should log audit entry with all fields', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
          fieldName: 'current_balance',
          oldValue: '1000.00',
          newValue: '1050.00',
          additionalContext: {
            interestAmount: '50.00',
            calculationDate: '2026-03-15',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log).not.toBeNull();
        expect(log!.level).toBe('info');
        expect(log!.message).toBe('Audit: UPDATE on ACCOUNT_BALANCE');
      });

      it('should include audit flag in log data', () => {
        const entry: AuditEntry = {
          action: 'CREATE',
          entityType: 'INTEREST_CALCULATION',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.audit).toBe(true);
      });

      it('should include action in log data', () => {
        const entry: AuditEntry = {
          action: 'DELETE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.action).toBe('DELETE');
      });

      it('should include entityType in log data', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'DISCLOSURE_GROUP',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityType).toBe('DISCLOSURE_GROUP');
      });

      it('should log entry without optional fields', () => {
        const entry: AuditEntry = {
          action: 'READ',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log).not.toBeNull();
        expect(log!.data.fieldName).toBeUndefined();
        expect(log!.data.oldValue).toBeUndefined();
        expect(log!.data.newValue).toBeUndefined();
        expect(log!.data.additionalContext).toBeUndefined();
      });
    });

    describe('sensitive data masking', () => {
      it('should mask entityId to show only last 4 digits', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityId).toBe('***8901');
      });

      it('should mask short entityId (less than 4 characters)', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: 'ABC',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityId).toBe('ABC');
      });

      it('should mask exactly 4 character entityId', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: 'ABCD',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityId).toBe('***ABCD');
      });

      it('should mask long entityId correctly', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901234567890',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityId).toBe('***7890');
      });

      it('should mask account-related fields in additionalContext', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            accountId: '98765432109',
            amount: '100.00',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.accountId).toBe('***2109');
        expect(context.amount).toBe('100.00');
      });

      it('should mask fields with account in name (case insensitive)', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            AccountNumber: '98765432109',
            accountid: '11111111111',
            ACCOUNTREF: '22222222222',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.AccountNumber).toBe('***2109');
        expect(context.accountid).toBe('***1111');
        expect(context.ACCOUNTREF).toBe('***2222');
      });

      it('should not mask non-account fields in additionalContext', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            interestAmount: '50.00',
            calculationDate: '2026-03-15',
            userId: 'user123',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.interestAmount).toBe('50.00');
        expect(context.calculationDate).toBe('2026-03-15');
        expect(context.userId).toBe('user123');
      });

      it('should not mask non-string values in additionalContext', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            accountNumber: 12345,
            isActive: true,
            balance: null,
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.accountNumber).toBe(12345);
        expect(context.isActive).toBe(true);
        expect(context.balance).toBe(null);
      });

      it('should mask short account values in context', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            accountId: 'ABC',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.accountId).toBe('ABC');
      });

      it('should handle empty additionalContext', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {},
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.additionalContext).toEqual({});
      });

      it('should not mutate original entry', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            accountId: '98765432109',
          },
        };

        const originalEntityId = entry.entityId;
        const originalAccountId = entry.additionalContext!.accountId;

        auditService.logAudit(entry);

        expect(entry.entityId).toBe(originalEntityId);
        expect(entry.additionalContext!.accountId).toBe(originalAccountId);
      });
    });

    describe('different actions', () => {
      it('should log CREATE action', () => {
        const entry: AuditEntry = {
          action: 'CREATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.message).toBe('Audit: CREATE on ACCOUNT');
      });

      it('should log UPDATE action', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.message).toBe('Audit: UPDATE on ACCOUNT_BALANCE');
      });

      it('should log DELETE action', () => {
        const entry: AuditEntry = {
          action: 'DELETE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.message).toBe('Audit: DELETE on ACCOUNT');
      });

      it('should log READ action', () => {
        const entry: AuditEntry = {
          action: 'READ',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.message).toBe('Audit: READ on ACCOUNT');
      });
    });

    describe('different entity types', () => {
      it('should log ACCOUNT entity type', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityType).toBe('ACCOUNT');
      });

      it('should log ACCOUNT_BALANCE entity type', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityType).toBe('ACCOUNT_BALANCE');
      });

      it('should log INTEREST_CALCULATION entity type', () => {
        const entry: AuditEntry = {
          action: 'CREATE',
          entityType: 'INTEREST_CALCULATION',
          entityId: '12345678901',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.entityType).toBe('INTEREST_CALCULATION');
      });
    });

    describe('field change tracking', () => {
      it('should log field name when provided', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
          fieldName: 'current_balance',
          oldValue: '1000.00',
          newValue: '1050.00',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.fieldName).toBe('current_balance');
      });

      it('should log old and new values', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
          fieldName: 'current_balance',
          oldValue: '1000.00',
          newValue: '1050.00',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.oldValue).toBe('1000.00');
        expect(log!.data.newValue).toBe('1050.00');
      });

      it('should handle empty string values', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          fieldName: 'description',
          oldValue: '',
          newValue: 'New Description',
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        expect(log!.data.oldValue).toBe('');
        expect(log!.data.newValue).toBe('New Description');
      });
    });

    describe('additional context', () => {
      it('should include simple context values', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT_BALANCE',
          entityId: '12345678901',
          additionalContext: {
            interestAmount: '50.00',
            calculationDate: '2026-03-15',
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.interestAmount).toBe('50.00');
        expect(context.calculationDate).toBe('2026-03-15');
      });

      it('should handle nested objects in context', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            metadata: {
              source: 'api',
              version: '1.0',
            },
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.metadata).toEqual({
          source: 'api',
          version: '1.0',
        });
      });

      it('should handle array values in context', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
          additionalContext: {
            tags: ['important', 'review'],
          },
        };

        auditService.logAudit(entry);

        const log = mockLogger.getLastLog();
        const context = log!.data.additionalContext as Record<string, unknown>;
        expect(context.tags).toEqual(['important', 'review']);
      });
    });

    describe('synchronous behavior', () => {
      it('should be synchronous and not return a value', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        const result = auditService.logAudit(entry);

        expect(result).toBeUndefined();
      });

      it('should log immediately', () => {
        const entry: AuditEntry = {
          action: 'UPDATE',
          entityType: 'ACCOUNT',
          entityId: '12345678901',
        };

        expect(mockLogger.getLogs().length).toBe(0);
        auditService.logAudit(entry);
        expect(mockLogger.getLogs().length).toBe(1);
      });
    });
  });
});
