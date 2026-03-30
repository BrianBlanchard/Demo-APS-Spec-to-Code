import { AuditService } from '../../src/services/audit.service';
import { logger } from '../../src/config/logger.config';
import { asyncLocalStorage, createContext } from '../../src/utils/context.util';
import { AuditContext } from '../../src/types/audit.types';

jest.mock('../../src/config/logger.config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
    jest.clearAllMocks();
  });

  describe('logSuccess', () => {
    it('should log successful operation', () => {
      const context: AuditContext = {
        operation: 'CYCLE_CLOSE',
        metadata: { billingCycle: '2024-01' },
      };

      const testContext = createContext('trace-123');
      asyncLocalStorage.run(testContext, () => {
        auditService.logSuccess(context);

        expect(logger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: 'CYCLE_CLOSE',
            status: 'SUCCESS',
            traceId: 'trace-123',
          }),
          'Operation CYCLE_CLOSE completed successfully'
        );
      });
    });

    it('should mask sensitive data in metadata', () => {
      const context: AuditContext = {
        operation: 'ACCOUNT_PROCESSING',
        metadata: {
          accountNumber: '1234567890',
          accountId: '9876543210',
        },
      };

      const testContext = createContext('trace-456');
      asyncLocalStorage.run(testContext, () => {
        auditService.logSuccess(context);

        const logCall = (logger.info as jest.Mock).mock.calls[0][0];
        expect(logCall.details.accountNumber).toBe('****7890');
        expect(logCall.details.accountId).toBe('****3210');
      });
    });
  });

  describe('logFailure', () => {
    it('should log failed operation with error message', () => {
      const context: AuditContext = {
        operation: 'CYCLE_CLOSE',
        metadata: { billingCycle: '2024-01' },
      };

      const testContext = createContext('trace-789');
      asyncLocalStorage.run(testContext, () => {
        auditService.logFailure(context, 'Database connection failed');

        expect(logger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: 'CYCLE_CLOSE',
            status: 'FAILURE',
            traceId: 'trace-789',
            error: 'Database connection failed',
          }),
          'Operation CYCLE_CLOSE failed'
        );
      });
    });
  });

  describe('logRetry', () => {
    it('should log retry attempt with attempt number', () => {
      const context: AuditContext = {
        operation: 'ACCOUNT_PROCESSING',
        metadata: { accountId: '123' },
      };

      const testContext = createContext('trace-retry');
      asyncLocalStorage.run(testContext, () => {
        auditService.logRetry(context, 2);

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            operation: 'ACCOUNT_PROCESSING',
            status: 'RETRY',
            traceId: 'trace-retry',
            details: expect.objectContaining({
              attempt: 2,
            }),
          }),
          'Operation ACCOUNT_PROCESSING retry attempt 2'
        );
      });
    });
  });
});
