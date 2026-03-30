import { AuditService } from '../audit.service';
import { requestContextStorage } from '../../utils/context.storage';
import { RequestContext } from '../../types';

describe('AuditService - Business/Service Layer', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  describe('logSearchAttempt', () => {
    it('should log search attempt with accountId and userId', () => {
      const context: RequestContext = {
        traceId: 'trace-123',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchAttempt('12345678901', 'user123');
        }).not.toThrow();
      });
    });

    it('should log search attempt without accountId', () => {
      const context: RequestContext = {
        traceId: 'trace-456',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchAttempt(undefined, 'user123');
        }).not.toThrow();
      });
    });

    it('should log search attempt without userId', () => {
      const context: RequestContext = {
        traceId: 'trace-789',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchAttempt('12345678901', undefined);
        }).not.toThrow();
      });
    });

    it('should mask accountId in logs', () => {
      const context: RequestContext = {
        traceId: 'trace-mask',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchAttempt('12345678901', 'user123');
        }).not.toThrow();
      });
    });
  });

  describe('logSearchSuccess', () => {
    it('should log search success with result count', () => {
      const context: RequestContext = {
        traceId: 'success-trace',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchSuccess(127, '12345678901', 'user123');
        }).not.toThrow();
      });
    });

    it('should log search success with zero results', () => {
      const context: RequestContext = {
        traceId: 'zero-results',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchSuccess(0, '12345678901', 'user123');
        }).not.toThrow();
      });
    });

    it('should log search success without optional parameters', () => {
      const context: RequestContext = {
        traceId: 'success-minimal',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchSuccess(50);
        }).not.toThrow();
      });
    });
  });

  describe('logSearchFailure', () => {
    it('should log search failure with error message', () => {
      const context: RequestContext = {
        traceId: 'failure-trace',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchFailure('Database connection failed', '12345678901', 'user123');
        }).not.toThrow();
      });
    });

    it('should log search failure without optional parameters', () => {
      const context: RequestContext = {
        traceId: 'failure-minimal',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchFailure('Unknown error');
        }).not.toThrow();
      });
    });

    it('should handle long error messages', () => {
      const context: RequestContext = {
        traceId: 'long-error',
        timestamp: '2024-01-15T14:30:00Z',
      };

      const longError = 'A'.repeat(1000);

      requestContextStorage.run(context, () => {
        expect(() => {
          auditService.logSearchFailure(longError, '12345678901', 'user123');
        }).not.toThrow();
      });
    });
  });
});
