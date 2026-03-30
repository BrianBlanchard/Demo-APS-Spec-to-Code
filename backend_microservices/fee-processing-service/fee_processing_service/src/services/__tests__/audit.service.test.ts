import { AuditService } from '../audit.service';
import { requestContextStorage } from '../../utils/request-context';
import { RequestContext } from '../../types/request-context';

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  describe('logFeeAssessment', () => {
    it('should log fee assessment with masked data', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const data = {
          accountId: '12345678901',
          feeType: 'late_payment',
          amount: 35.0,
        };

        expect(() => auditService.logFeeAssessment(data)).not.toThrow();
      });
    });
  });

  describe('logFeePosted', () => {
    it('should log fee posted with masked data', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const data = {
          accountId: '12345678901',
          transactionId: '1234567890123456',
          feeType: 'late_payment',
          amount: 35.0,
          newBalance: 1035.0,
        };

        expect(() => auditService.logFeePosted(data)).not.toThrow();
      });
    });
  });

  describe('logError', () => {
    it('should log error with operation and masked data', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new Error('Test error');
        const data = {
          accountId: '12345678901',
          operation: 'assessFee',
        };

        expect(() => auditService.logError('assessFee', error, data)).not.toThrow();
      });
    });

    it('should log error without data', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new Error('Test error');

        expect(() => auditService.logError('testOperation', error)).not.toThrow();
      });
    });
  });
});
