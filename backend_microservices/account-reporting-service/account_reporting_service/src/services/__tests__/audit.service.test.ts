import { AuditService, AuditEvent } from '../audit.service';

// Mock the logger at module level
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerDebug = jest.fn();

jest.mock('../../utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    debug: (...args: unknown[]) => mockLoggerDebug(...args),
  })),
}));

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    mockLoggerInfo.mockClear();
    auditService = new AuditService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log audit event with all fields', () => {
      const event: AuditEvent = {
        action: 'GENERATE_REPORT',
        resource: 'report',
        resourceId: 'RPT-20240131-ABC123',
        status: 'success',
        details: { reportType: 'account_status' },
      };

      auditService.logEvent(event);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'GENERATE_REPORT',
          resource: 'report',
          status: 'success',
        }),
        'Audit event logged'
      );
    });

    it('should mask resource ID', () => {
      const event: AuditEvent = {
        action: 'GENERATE_REPORT',
        resource: 'report',
        resourceId: 'RPT-20240131-ABC123',
        status: 'success',
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.resourceId).toBe('RPT-****');
    });

    it('should mask sensitive data in details', () => {
      const event: AuditEvent = {
        action: 'FETCH_ACCOUNT',
        resource: 'account',
        status: 'success',
        details: {
          accountId: '123456789',
          balance: 5000.50,
          creditLimit: 10000,
        },
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.details.accountId).toBe('***MASKED***');
      expect(callArgs.details.balance).toBe('***MASKED***');
      expect(callArgs.details.creditLimit).toBe('***MASKED***');
    });

    it('should log event with success status', () => {
      const event: AuditEvent = {
        action: 'CREATE_REPORT',
        resource: 'report',
        status: 'success',
      };

      auditService.logEvent(event);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        }),
        'Audit event logged'
      );
    });

    it('should log event with failure status', () => {
      const event: AuditEvent = {
        action: 'GENERATE_REPORT',
        resource: 'report',
        status: 'failure',
        details: { reason: 'Database connection failed' },
      };

      auditService.logEvent(event);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failure',
        }),
        'Audit event logged'
      );
    });

    it('should handle event without resource ID', () => {
      const event: AuditEvent = {
        action: 'LIST_REPORTS',
        resource: 'reports',
        status: 'success',
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.resourceId).toBeUndefined();
    });

    it('should handle event without details', () => {
      const event: AuditEvent = {
        action: 'HEALTH_CHECK',
        resource: 'system',
        status: 'success',
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.details).toBeUndefined();
    });

    it('should mask short resource IDs', () => {
      const event: AuditEvent = {
        action: 'TEST',
        resource: 'test',
        resourceId: 'ABC',
        status: 'success',
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.resourceId).toBe('****');
    });

    it('should not mask non-sensitive data in details', () => {
      const event: AuditEvent = {
        action: 'GENERATE_REPORT',
        resource: 'report',
        status: 'success',
        details: {
          reportType: 'account_status',
          format: 'csv',
          timestamp: '2024-01-31T10:30:00Z',
        },
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.details.reportType).toBe('account_status');
      expect(callArgs.details.format).toBe('csv');
      expect(callArgs.details.timestamp).toBe('2024-01-31T10:30:00Z');
    });

    it('should mask customerId in details', () => {
      const event: AuditEvent = {
        action: 'FETCH_CUSTOMER',
        resource: 'customer',
        status: 'success',
        details: {
          customerId: 'CUST-12345',
          name: 'John Doe',
        },
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.details.customerId).toBe('***MASKED***');
    });

    it('should handle empty details object', () => {
      const event: AuditEvent = {
        action: 'TEST',
        resource: 'test',
        status: 'success',
        details: {},
      };

      auditService.logEvent(event);

      const callArgs = mockLoggerInfo.mock.calls[0][0];
      expect(callArgs.details).toEqual({});
    });

    it('should not modify original event object', () => {
      const event: AuditEvent = {
        action: 'GENERATE_REPORT',
        resource: 'report',
        resourceId: 'RPT-20240131-ABC123',
        status: 'success',
        details: { accountId: '123456' },
      };

      const originalEvent = { ...event, details: { ...event.details } };

      auditService.logEvent(event);

      expect(event).toEqual(originalEvent);
    });

    it('should handle multiple audit events sequentially', () => {
      const events: AuditEvent[] = [
        { action: 'CREATE', resource: 'report', status: 'success' },
        { action: 'UPDATE', resource: 'report', status: 'success' },
        { action: 'DELETE', resource: 'report', status: 'failure' },
      ];

      events.forEach(event => auditService.logEvent(event));

      expect(mockLoggerInfo).toHaveBeenCalledTimes(3);
    });
  });
});
