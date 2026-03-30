import { AuditService } from '../../src/services/audit.service';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import logger from '../../src/utils/logger';

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
    jest.clearAllMocks();
  });

  describe('logOperation - Success', () => {
    it('should log successful operation with info level', () => {
      auditService.logOperation('test_operation', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'success',
        }),
        'Operation completed successfully'
      );
    });

    it('should log successful operation with details', () => {
      const details = { userId: '12345', action: 'create' };

      auditService.logOperation('test_operation', 'success', details);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'success',
          details: expect.any(Object),
        }),
        'Operation completed successfully'
      );
    });

    it('should not call error or warn loggers for success', () => {
      auditService.logOperation('test_operation', 'success');

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should include error field as undefined for success without error', () => {
      auditService.logOperation('test_operation', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          error: undefined,
        }),
        expect.any(String)
      );
    });
  });

  describe('logOperation - Failure', () => {
    it('should log failed operation with error level', () => {
      auditService.logOperation('test_operation', 'failure');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'failure',
        }),
        'Operation failed'
      );
    });

    it('should log failed operation with error message', () => {
      auditService.logOperation('test_operation', 'failure', undefined, 'Something went wrong');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'failure',
          error: 'Something went wrong',
        }),
        'Operation failed'
      );
    });

    it('should log failed operation with details and error', () => {
      const details = { userId: '12345', action: 'delete' };

      auditService.logOperation('test_operation', 'failure', details, 'Database error');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'failure',
          details: expect.any(Object),
          error: 'Database error',
        }),
        'Operation failed'
      );
    });

    it('should not call info or warn loggers for failure', () => {
      auditService.logOperation('test_operation', 'failure');

      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('logOperation - Retry', () => {
    it('should log retry operation with warn level', () => {
      auditService.logOperation('test_operation', 'retry');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'retry',
        }),
        'Operation retry'
      );
    });

    it('should log retry operation with details', () => {
      const details = { attemptNumber: 2, maxAttempts: 3 };

      auditService.logOperation('test_operation', 'retry', details);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'retry',
          details: expect.any(Object),
        }),
        'Operation retry'
      );
    });

    it('should log retry operation with error message', () => {
      auditService.logOperation('test_operation', 'retry', undefined, 'Temporary failure');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'retry',
          error: 'Temporary failure',
        }),
        'Operation retry'
      );
    });

    it('should not call info or error loggers for retry', () => {
      auditService.logOperation('test_operation', 'retry');

      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('Sensitive data masking', () => {
    it('should mask accountId', () => {
      const details = { accountId: 'ACC123456789' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.accountId).toBe('***6789');
    });

    it('should mask customerId', () => {
      const details = { customerId: 'CUST987654321' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerId).toBe('***4321');
    });

    it('should mask customerName', () => {
      const details = { customerName: 'John Doe Smith' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerName).toBe('***mith');
    });

    it('should mask merchantName', () => {
      const details = { merchantName: 'Test Restaurant Inc' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.merchantName).toBe('*** Inc');
    });

    it('should mask amount', () => {
      const details = { amount: 123.45 };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.amount).toBe('***.**');
    });

    it('should mask multiple sensitive fields', () => {
      const details = {
        accountId: 'ACC123456789',
        customerId: 'CUST987654321',
        amount: 100.0,
        merchantName: 'Test Merchant',
      };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.accountId).toBe('***6789');
      expect(logCall.details.customerId).toBe('***4321');
      expect(logCall.details.amount).toBe('***.**');
      expect(logCall.details.merchantName).toBe('***hant');
    });

    it('should not mask non-sensitive fields', () => {
      const details = {
        merchantCategoryCode: '5812',
        transactionId: 'TXN123',
        status: 'completed',
      };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.merchantCategoryCode).toBe('5812');
      expect(logCall.details.transactionId).toBe('TXN123');
      expect(logCall.details.status).toBe('completed');
    });

    it('should mask short values (less than 4 chars) completely', () => {
      const details = { customerId: 'ABC' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerId).toBe('***');
    });

    it('should handle empty string values', () => {
      const details = { customerId: '' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerId).toBe('***');
    });

    it('should convert number values to string before masking', () => {
      const details = { customerId: 12345 };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerId).toBe('***2345');
    });

    it('should preserve last 4 characters for values longer than 4 chars', () => {
      const details = { accountId: '1234567890' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.accountId).toBe('***7890');
    });

    it('should handle exactly 4 character values', () => {
      const details = { customerId: '1234' };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.customerId).toBe('***');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined details', () => {
      auditService.logOperation('test_operation', 'success', undefined);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'success',
          details: undefined,
        }),
        'Operation completed successfully'
      );
    });

    it('should handle empty details object', () => {
      auditService.logOperation('test_operation', 'success', {});

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'test_operation',
          status: 'success',
          details: {},
        }),
        'Operation completed successfully'
      );
    });

    it('should handle null values in details', () => {
      const details = { accountId: null };

      auditService.logOperation('test_operation', 'success', details as any);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.accountId).toBe('***');
    });

    it('should handle boolean values in details', () => {
      const details = { isActive: true };

      auditService.logOperation('test_operation', 'success', details as any);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.isActive).toBe(true);
    });

    it('should handle nested objects in details', () => {
      const details = {
        user: { id: '123', name: 'John' },
        metadata: { timestamp: '2024-01-01' },
      };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.user).toEqual({ id: '123', name: 'John' });
      expect(logCall.details.metadata).toEqual({ timestamp: '2024-01-01' });
    });

    it('should handle array values in details', () => {
      const details = { items: ['item1', 'item2', 'item3'] };

      auditService.logOperation('test_operation', 'success', details);

      const logCall = (logger.info as jest.Mock).mock.calls[0][0];
      expect(logCall.details.items).toEqual(['item1', 'item2', 'item3']);
    });

    it('should not modify original details object', () => {
      const details = { accountId: 'ACC123456789', merchantCategoryCode: '5812' };
      const originalDetails = { ...details };

      auditService.logOperation('test_operation', 'success', details);

      expect(details).toEqual(originalDetails);
    });
  });

  describe('Operation names', () => {
    it('should handle operation with underscores', () => {
      auditService.logOperation('categorize_transaction', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'categorize_transaction',
        }),
        expect.any(String)
      );
    });

    it('should handle operation with hyphens', () => {
      auditService.logOperation('categorize-transaction', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'categorize-transaction',
        }),
        expect.any(String)
      );
    });

    it('should handle camelCase operation names', () => {
      auditService.logOperation('categorizeTransaction', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'categorizeTransaction',
        }),
        expect.any(String)
      );
    });

    it('should handle PascalCase operation names', () => {
      auditService.logOperation('CategorizeTransaction', 'success');

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'CategorizeTransaction',
        }),
        expect.any(String)
      );
    });
  });

  describe('Error messages', () => {
    it('should handle empty error message', () => {
      auditService.logOperation('test_operation', 'failure', undefined, '');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: '',
        }),
        'Operation failed'
      );
    });

    it('should handle long error message', () => {
      const longError = 'A'.repeat(1000);

      auditService.logOperation('test_operation', 'failure', undefined, longError);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: longError,
        }),
        'Operation failed'
      );
    });

    it('should handle error message with special characters', () => {
      auditService.logOperation('test_operation', 'failure', undefined, 'Error: $@#%^&*()');

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error: $@#%^&*()',
        }),
        'Operation failed'
      );
    });
  });
});
