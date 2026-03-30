import { AuditService, AuditLogEntry } from '../../src/services/audit.service';

// Mock dependencies
jest.mock('../../src/config/logger.config');
jest.mock('../../src/utils/encryption.util');

import { logger, getTraceId } from '../../src/config/logger.config';
import { maskSensitiveData } from '../../src/utils/encryption.util';

const mockLoggerInfo = logger.info as jest.Mock;
const mockGetTraceId = getTraceId as jest.Mock;
const mockMaskSensitiveData = maskSensitiveData as jest.Mock;

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = new AuditService();

    // Set up default mock implementations
    mockGetTraceId.mockReturnValue('trace-123-456-789');
    mockMaskSensitiveData.mockImplementation((data: string, visibleChars: number) => {
      if (visibleChars === 0 || data.length <= visibleChars) {
        return '*'.repeat(data.length);
      }
      const masked = '*'.repeat(data.length - visibleChars);
      return masked + data.slice(-visibleChars);
    });

    // Mock Date.now() for consistent timestamps
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-27T10:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('log - Basic Functionality', () => {
    it('should log audit entry with all fields', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: 'user-123',
        customerId: 'customer-456',
        status: 'success',
        details: {
          ficoScore: 750,
          creditLimit: 10000,
        },
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          audit: {
            timestamp: '2026-03-27T10:30:00.000Z',
            traceId: 'trace-123-456-789',
            action: 'CREATE_CUSTOMER',
            userId: 'user-123',
            customerId: '********-456', // 'customer-456' -> 8 asterisks + '-456'
            status: 'success',
            details: {
              ficoScore: 750,
              creditLimit: 10000,
            },
          },
        },
        'Audit log entry'
      );
    });

    it('should log audit entry without optional userId', () => {
      const entry: AuditLogEntry = {
        action: 'SYSTEM_CLEANUP',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.userId).toBeUndefined();
      expect(loggedData.audit.action).toBe('SYSTEM_CLEANUP');
    });

    it('should log audit entry without optional customerId', () => {
      const entry: AuditLogEntry = {
        action: 'USER_LOGIN',
        userId: 'user-123',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.customerId).toBeUndefined();
      expect(loggedData.audit.userId).toBe('user-123');
    });

    it('should log audit entry without optional details', () => {
      const entry: AuditLogEntry = {
        action: 'DELETE_CUSTOMER',
        userId: 'user-123',
        customerId: 'customer-456',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details).toBeUndefined();
    });

    it('should log audit entry with only required fields', () => {
      const entry: AuditLogEntry = {
        action: 'BACKGROUND_JOB',
        status: 'failure',
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          audit: {
            timestamp: '2026-03-27T10:30:00.000Z',
            traceId: 'trace-123-456-789',
            action: 'BACKGROUND_JOB',
            userId: undefined,
            customerId: undefined,
            status: 'failure',
            details: undefined,
          },
        },
        'Audit log entry'
      );
    });
  });

  describe('log - Timestamp Generation', () => {
    it('should generate ISO timestamp for audit entry', () => {
      const entry: AuditLogEntry = {
        action: 'TEST_ACTION',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.timestamp).toBe('2026-03-27T10:30:00.000Z');
    });

    it('should generate different timestamps for different calls', () => {
      const entry: AuditLogEntry = {
        action: 'TEST_ACTION',
        status: 'success',
      };

      auditService.log(entry);

      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000);

      auditService.log(entry);

      const firstTimestamp = mockLoggerInfo.mock.calls[0][0].audit.timestamp;
      const secondTimestamp = mockLoggerInfo.mock.calls[1][0].audit.timestamp;

      expect(firstTimestamp).toBe('2026-03-27T10:30:00.000Z');
      expect(secondTimestamp).toBe('2026-03-27T10:30:05.000Z');
    });
  });

  describe('log - Trace ID', () => {
    it('should include trace ID from logger config', () => {
      mockGetTraceId.mockReturnValue('custom-trace-id-abc');

      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.traceId).toBe('custom-trace-id-abc');
      expect(mockGetTraceId).toHaveBeenCalledTimes(1);
    });

    it('should call getTraceId for each log entry', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);
      auditService.log(entry);
      auditService.log(entry);

      expect(mockGetTraceId).toHaveBeenCalledTimes(3);
    });
  });

  describe('log - Customer ID Masking', () => {
    it('should mask customer ID with last 4 characters visible', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        customerId: 'CUST-123456789',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('CUST-123456789', 4);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.customerId).toBe('**********6789');
    });

    it('should handle short customer IDs', () => {
      mockMaskSensitiveData.mockImplementation((data: string, visibleChars: number) => {
        if (data.length <= visibleChars) {
          return '*'.repeat(data.length);
        }
        const masked = '*'.repeat(data.length - visibleChars);
        return masked + data.slice(-visibleChars);
      });

      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        customerId: 'C123',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('C123', 4);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.customerId).toBe('****');
    });

    it('should not mask customer ID if not provided', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).not.toHaveBeenCalled();
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.customerId).toBeUndefined();
    });
  });

  describe('log - Sensitive Details Masking', () => {
    it('should mask SSN in details', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
        details: {
          ssn: '123-45-6789',
          other: 'data',
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('123-45-6789', 4);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.ssn).toBe('*******6789');
      expect(loggedData.audit.details.other).toBe('data');
    });

    it('should mask Government ID in details', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
        details: {
          governmentId: 'DL12345678',
          ficoScore: 750,
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('DL12345678', 4);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.governmentId).toBe('******5678');
      expect(loggedData.audit.details.ficoScore).toBe(750);
    });

    it('should mask EFT Account ID in details', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
        details: {
          eftAccountId: 'EFT987654321',
          creditLimit: 10000,
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('EFT987654321', 4);
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.eftAccountId).toBe('********4321');
      expect(loggedData.audit.details.creditLimit).toBe(10000);
    });

    it('should mask multiple sensitive fields in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          ssn: '123-45-6789',
          governmentId: 'DL12345678',
          eftAccountId: 'EFT987654321',
          ficoScore: 750,
          creditLimit: 10000,
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).toHaveBeenCalledWith('123-45-6789', 4);
      expect(mockMaskSensitiveData).toHaveBeenCalledWith('DL12345678', 4);
      expect(mockMaskSensitiveData).toHaveBeenCalledWith('EFT987654321', 4);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.ssn).toBe('*******6789');
      expect(loggedData.audit.details.governmentId).toBe('******5678');
      expect(loggedData.audit.details.eftAccountId).toBe('********4321');
      expect(loggedData.audit.details.ficoScore).toBe(750);
      expect(loggedData.audit.details.creditLimit).toBe(10000);
    });

    it('should not mask non-string sensitive fields', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
        details: {
          ssn: 123456789, // Number instead of string
          governmentId: null,
          eftAccountId: undefined,
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).not.toHaveBeenCalled();
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.ssn).toBe(123456789);
      expect(loggedData.audit.details.governmentId).toBeNull();
      expect(loggedData.audit.details.eftAccountId).toBeUndefined();
    });

    it('should preserve non-sensitive fields in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          ficoScore: 750,
          creditLimit: 10000,
          verificationStatus: 'pending',
          isPrimaryCardholder: true,
        },
      };

      auditService.log(entry);

      expect(mockMaskSensitiveData).not.toHaveBeenCalled();
      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details).toEqual({
        ficoScore: 750,
        creditLimit: 10000,
        verificationStatus: 'pending',
        isPrimaryCardholder: true,
      });
    });

    it('should return undefined when details is not provided', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details).toBeUndefined();
    });

    it('should not mutate original details object', () => {
      const details = {
        ssn: '123-45-6789',
        ficoScore: 750,
      };

      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details,
      };

      auditService.log(entry);

      // Original details should remain unchanged
      expect(details.ssn).toBe('123-45-6789');
      expect(details.ficoScore).toBe(750);
    });
  });

  describe('log - Status Values', () => {
    it('should log success status', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.status).toBe('success');
    });

    it('should log failure status', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'failure',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.status).toBe('failure');
    });
  });

  describe('log - Action Types', () => {
    it('should log CREATE_CUSTOMER action', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe('CREATE_CUSTOMER');
    });

    it('should log UPDATE_CUSTOMER action', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe('UPDATE_CUSTOMER');
    });

    it('should log DELETE_CUSTOMER action', () => {
      const entry: AuditLogEntry = {
        action: 'DELETE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe('DELETE_CUSTOMER');
    });

    it('should log custom action strings', () => {
      const entry: AuditLogEntry = {
        action: 'CUSTOM_BUSINESS_OPERATION',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe('CUSTOM_BUSINESS_OPERATION');
    });
  });

  describe('log - Complex Details', () => {
    it('should handle nested objects in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          customer: {
            firstName: 'John',
            lastName: 'Doe',
          },
          metadata: {
            source: 'web',
            version: '1.0',
          },
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details).toEqual({
        customer: {
          firstName: 'John',
          lastName: 'Doe',
        },
        metadata: {
          source: 'web',
          version: '1.0',
        },
      });
    });

    it('should handle arrays in details', () => {
      const entry: AuditLogEntry = {
        action: 'BATCH_UPDATE',
        status: 'success',
        details: {
          customerIds: ['123', '456', '789'],
          updateCount: 3,
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.customerIds).toEqual(['123', '456', '789']);
      expect(loggedData.audit.details.updateCount).toBe(3);
    });

    it('should handle null and undefined values in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          nullValue: null,
          undefinedValue: undefined,
          normalValue: 'test',
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.nullValue).toBeNull();
      expect(loggedData.audit.details.undefinedValue).toBeUndefined();
      expect(loggedData.audit.details.normalValue).toBe('test');
    });

    it('should handle boolean values in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          isPrimaryCardholder: true,
          isVerified: false,
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.isPrimaryCardholder).toBe(true);
      expect(loggedData.audit.details.isVerified).toBe(false);
    });

    it('should handle numeric values in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          ficoScore: 750,
          creditLimit: 10000.5,
          age: 30,
          successRate: 0.95,
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.ficoScore).toBe(750);
      expect(loggedData.audit.details.creditLimit).toBe(10000.5);
      expect(loggedData.audit.details.age).toBe(30);
      expect(loggedData.audit.details.successRate).toBe(0.95);
    });
  });

  describe('log - Edge Cases', () => {
    it('should handle empty details object', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {},
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details).toEqual({});
    });

    it('should handle empty strings in details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          emptyString: '',
          normalString: 'test',
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.emptyString).toBe('');
      expect(loggedData.audit.details.normalString).toBe('test');
    });

    it('should handle special characters in action', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER_V2.0-BETA',
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe('CREATE_CUSTOMER_V2.0-BETA');
    });

    it('should handle very long action strings', () => {
      const longAction = 'A'.repeat(1000);
      const entry: AuditLogEntry = {
        action: longAction,
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.action).toBe(longAction);
    });

    it('should handle very long userId strings', () => {
      const longUserId = 'user-' + 'x'.repeat(500);
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: longUserId,
        status: 'success',
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.userId).toBe(longUserId);
    });
  });

  describe('log - Multiple Invocations', () => {
    it('should handle multiple log calls independently', () => {
      const entry1: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: 'user-1',
        status: 'success',
      };

      const entry2: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        userId: 'user-2',
        status: 'failure',
      };

      auditService.log(entry1);
      auditService.log(entry2);

      expect(mockLoggerInfo).toHaveBeenCalledTimes(2);

      const firstCall = mockLoggerInfo.mock.calls[0][0];
      expect(firstCall.audit.action).toBe('CREATE_CUSTOMER');
      expect(firstCall.audit.userId).toBe('user-1');
      expect(firstCall.audit.status).toBe('success');

      const secondCall = mockLoggerInfo.mock.calls[1][0];
      expect(secondCall.audit.action).toBe('UPDATE_CUSTOMER');
      expect(secondCall.audit.userId).toBe('user-2');
      expect(secondCall.audit.status).toBe('failure');
    });

    it('should not share state between log calls', () => {
      const entry1: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
        details: {
          ssn: '123-45-6789',
        },
      };

      const entry2: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        status: 'success',
        details: {
          ficoScore: 750,
        },
      };

      auditService.log(entry1);
      auditService.log(entry2);

      const firstCall = mockLoggerInfo.mock.calls[0][0];
      const secondCall = mockLoggerInfo.mock.calls[1][0];

      expect(firstCall.audit.details.ssn).toBe('*******6789');
      expect(firstCall.audit.details.ficoScore).toBeUndefined();

      expect(secondCall.audit.details.ssn).toBeUndefined();
      expect(secondCall.audit.details.ficoScore).toBe(750);
    });
  });

  describe('log - Integration Scenarios', () => {
    it('should log successful customer creation with all details', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: 'user-123',
        customerId: 'customer-789',
        status: 'success',
        details: {
          ficoScore: 750,
          creditLimit: 10000,
          verificationStatus: 'pending',
        },
      };

      auditService.log(entry);

      expect(mockGetTraceId).toHaveBeenCalled();
      expect(mockMaskSensitiveData).toHaveBeenCalledWith('customer-789', 4);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        {
          audit: {
            timestamp: '2026-03-27T10:30:00.000Z',
            traceId: 'trace-123-456-789',
            action: 'CREATE_CUSTOMER',
            userId: 'user-123',
            customerId: '********-789', // 'customer-789' -> 8 asterisks + '-789'
            status: 'success',
            details: {
              ficoScore: 750,
              creditLimit: 10000,
              verificationStatus: 'pending',
            },
          },
        },
        'Audit log entry'
      );
    });

    it('should log failed customer creation due to duplicate SSN', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: 'user-123',
        status: 'failure',
        details: {
          reason: 'Duplicate SSN',
          customerId: 'existing-customer-456',
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.status).toBe('failure');
      expect(loggedData.audit.details.reason).toBe('Duplicate SSN');
      expect(loggedData.audit.details.customerId).toBe('existing-customer-456');
    });

    it('should log failed customer creation due to duplicate Government ID', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        userId: 'user-123',
        status: 'failure',
        details: {
          reason: 'Duplicate Government ID',
          customerId: 'existing-customer-789',
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.status).toBe('failure');
      expect(loggedData.audit.details.reason).toBe('Duplicate Government ID');
      expect(loggedData.audit.details.customerId).toBe('existing-customer-789');
    });

    it('should log customer update with masked sensitive data', () => {
      const entry: AuditLogEntry = {
        action: 'UPDATE_CUSTOMER',
        userId: 'user-123',
        customerId: 'customer-456',
        status: 'success',
        details: {
          ssn: '123-45-6789',
          governmentId: 'DL12345678',
          updatedFields: ['ssn', 'governmentId'],
        },
      };

      auditService.log(entry);

      const loggedData = mockLoggerInfo.mock.calls[0][0];
      expect(loggedData.audit.details.ssn).toBe('*******6789');
      expect(loggedData.audit.details.governmentId).toBe('******5678');
      expect(loggedData.audit.details.updatedFields).toEqual(['ssn', 'governmentId']);
    });
  });

  describe('log - Logger Message', () => {
    it('should always use "Audit log entry" as the log message', () => {
      const entry: AuditLogEntry = {
        action: 'CREATE_CUSTOMER',
        status: 'success',
      };

      auditService.log(entry);

      expect(mockLoggerInfo).toHaveBeenCalledWith(expect.any(Object), 'Audit log entry');
    });
  });
});
