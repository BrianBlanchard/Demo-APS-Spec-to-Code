import { AuditService } from '../../src/services/audit.service';
import { logger } from '../../src/utils/logger';
import { runWithContext } from '../../src/utils/request-context';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('AuditService', () => {
  let auditService: AuditService;
  let mockLogger: jest.Mocked<typeof logger>;

  beforeEach(() => {
    auditService = new AuditService();
    mockLogger = logger as jest.Mocked<typeof logger>;
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should log audit event with all parameters', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', 'Test details');

        expect(mockLogger.info).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            audit: true,
            action: 'TEST_ACTION',
            status: 'SUCCESS',
          }),
          'Audit log'
        );
      });
    });

    it('should mask customer ID', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123456', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.customerId).not.toBe('CUST123456');
        expect(logCall.customerId).toContain('**');
      });
    });

    it('should include timestamp', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.timestamp).toBeDefined();
        expect(typeof logCall.timestamp).toBe('string');
      });
    });

    it('should include trace ID', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.traceId).toBeDefined();
        expect(typeof logCall.traceId).toBe('string');
        expect(logCall.traceId).not.toBe('unknown');
      });
    });

    it('should log SUCCESS status', () => {
      runWithContext(() => {
        auditService.log('UPDATE_PREFERENCES', 'CUST123', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.status).toBe('SUCCESS');
      });
    });

    it('should log FAILURE status', () => {
      runWithContext(() => {
        auditService.log('UPDATE_PREFERENCES', 'CUST123', 'FAILURE');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.status).toBe('FAILURE');
      });
    });

    it('should log without details parameter', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS');

        expect(mockLogger.info).toHaveBeenCalledTimes(1);
        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).toBeUndefined();
      });
    });

    it('should mask sensitive data in details', () => {
      runWithContext(() => {
        const details = 'Customer email: test@example.com, SSN: 123-45-6789';
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', details);

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).not.toContain('123-45-6789');
        expect(logCall.details).not.toContain('test@example.com');
        expect(logCall.details).toContain('***@***.***');
        expect(logCall.details).toContain('***-**-****');
      });
    });

    it('should mask SSN pattern', () => {
      runWithContext(() => {
        const details = 'SSN: 999-88-7777';
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', details);

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).not.toContain('999-88-7777');
        expect(logCall.details).toContain('***-**-****');
      });
    });

    it('should mask email pattern', () => {
      runWithContext(() => {
        const details = 'Email: john.doe@example.com';
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', details);

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).not.toContain('john.doe@example.com');
        expect(logCall.details).toContain('***@***.***');
      });
    });

    it('should mask credit card pattern', () => {
      runWithContext(() => {
        const details = 'Card: 1234567890123456';
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', details);

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).not.toContain('1234567890123456');
        expect(logCall.details).toContain('****-****-****-****');
      });
    });

    it('should mask short customer IDs', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'ABC', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.customerId).toBe('****');
      });
    });

    it('should preserve first and last 2 characters of customer ID', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUSTOMER123456', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.customerId).toMatch(/^CU\*+56$/);
      });
    });

    it('should log action for preference updates', () => {
      runWithContext(() => {
        auditService.log('UPDATE_NOTIFICATION_PREFERENCES', 'CUST123', 'SUCCESS');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.action).toBe('UPDATE_NOTIFICATION_PREFERENCES');
      });
    });

    it('should treat empty details string as undefined', () => {
      runWithContext(() => {
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', '');

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).toBeUndefined();
      });
    });

    it('should handle details with no sensitive data', () => {
      runWithContext(() => {
        const details = 'Simple log message without sensitive data';
        auditService.log('TEST_ACTION', 'CUST123', 'SUCCESS', details);

        const logCall = mockLogger.info.mock.calls[0][0] as any;
        expect(logCall.details).toBe(details);
      });
    });
  });
});
