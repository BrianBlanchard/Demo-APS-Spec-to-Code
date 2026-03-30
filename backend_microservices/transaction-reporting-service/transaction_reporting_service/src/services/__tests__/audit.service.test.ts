import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuditService } from '../audit.service';
import logger from '../../utils/logger';

jest.mock('../../utils/logger');

describe('AuditService', () => {
  let auditService: AuditService;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    auditService = new AuditService();
    mockLogger = logger as jest.Mocked<typeof logger>;
    (mockLogger as unknown as Record<string, jest.Mock>).info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should log audit event', () => {
      const auditLog = {
        action: 'test_action',
        status: 'success' as const,
      };

      auditService.log(auditLog);

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'test_action',
          status: 'success',
        }),
        'Audit: test_action'
      );
    });

    it('should mask sensitive data in details', () => {
      const auditLog = {
        action: 'test_action',
        status: 'success' as const,
        details: {
          userId: 'user-123',
          customerId: 'customer-456',
          accountId: 'account-789',
          amount: 100.50,
          balance: 1000.00,
          name: 'John Doe',
        },
      };

      auditService.log(auditLog);

      const loggedData = (mockLogger.info as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      const details = loggedData.details as Record<string, unknown>;
      expect(details.userId).toBe('***MASKED***');
      expect(details.customerId).toBe('***MASKED***');
      expect(details.accountId).toBe('***MASKED***');
      expect(details.amount).toBe('***MASKED***');
      expect(details.balance).toBe('***MASKED***');
      expect(details.name).toBe('John Doe'); // Not masked
    });

    it('should log with error message', () => {
      const auditLog = {
        action: 'failed_action',
        status: 'failure' as const,
        error: 'Something went wrong',
      };

      auditService.log(auditLog);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'failed_action',
          status: 'failure',
          error: 'Something went wrong',
        }),
        'Audit: failed_action'
      );
    });

    it('should handle retry status', () => {
      const auditLog = {
        action: 'retry_action',
        status: 'retry' as const,
      };

      auditService.log(auditLog);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'retry_action',
          status: 'retry',
        }),
        'Audit: retry_action'
      );
    });

    it('should not modify original audit log', () => {
      const auditLog = {
        action: 'test_action',
        status: 'success' as const,
        details: {
          userId: 'user-123',
        },
      };

      const originalDetails = { ...auditLog.details };

      auditService.log(auditLog);

      expect(auditLog.details.userId).toBe(originalDetails.userId);
    });
  });
});
