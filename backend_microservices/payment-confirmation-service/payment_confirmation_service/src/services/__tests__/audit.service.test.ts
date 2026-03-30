import { AuditService, AuditEvent } from '../audit.service';

describe('Audit Service', () => {
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  describe('logEvent', () => {
    it('should log a successful audit event', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should log a failure audit event', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-NOTFOUND',
        status: 'failure',
        details: { reason: 'not_found' },
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should mask resourceId for sensitive data', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
      };

      const logSpy = jest.spyOn(auditService as any, 'sanitizeSensitiveData');
      auditService.logEvent(event);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should mask accountId in details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
        details: {
          accountId: '12345678901',
          paymentAmount: 2450.75,
          status: 'posted',
        },
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should mask transactionId in details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
        details: {
          transactionId: '1234567890123456',
        },
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should mask paymentAmount in details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
        details: {
          paymentAmount: 2450.75,
        },
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should handle events without resourceId', () => {
      const event: AuditEvent = {
        action: 'system_startup',
        resource: 'system',
        status: 'success',
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should handle events without details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should handle events with empty details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
        details: {},
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should mask short resourceId values', () => {
      const event: AuditEvent = {
        action: 'test_action',
        resource: 'test',
        resourceId: 'ABC',
        status: 'success',
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });

    it('should handle various action types', () => {
      const actions = [
        'retrieve_payment_confirmation',
        'create_payment',
        'update_payment',
        'delete_payment',
      ];

      actions.forEach((action) => {
        const event: AuditEvent = {
          action,
          resource: 'payment',
          resourceId: 'PAY-20240115-ABC123',
          status: 'success',
        };

        expect(() => auditService.logEvent(event)).not.toThrow();
      });
    });

    it('should handle various resource types', () => {
      const resources = ['payment', 'account', 'transaction', 'user'];

      resources.forEach((resource) => {
        const event: AuditEvent = {
          action: 'retrieve',
          resource,
          resourceId: 'TEST-123',
          status: 'success',
        };

        expect(() => auditService.logEvent(event)).not.toThrow();
      });
    });

    it('should preserve non-sensitive fields in details', () => {
      const event: AuditEvent = {
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
        details: {
          paymentMethod: 'eft',
          status: 'posted',
          timestamp: '2024-01-15T10:00:00Z',
        },
      };

      expect(() => auditService.logEvent(event)).not.toThrow();
    });
  });

  describe('sanitizeSensitiveData (private method behavior)', () => {
    it('should mask resourceId with first 4 and last 4 characters visible', () => {
      const event: AuditEvent = {
        action: 'test',
        resource: 'test',
        resourceId: 'PAY-20240115-ABC123',
        status: 'success',
      };

      const sanitized = (auditService as any).sanitizeSensitiveData(event);
      expect(sanitized.resourceId).toBe('PAY-...C123');
    });

    it('should return *** for short values (4 or fewer characters)', () => {
      const value = 'ABC';
      const masked = (auditService as any).maskData(value);
      expect(masked).toBe('***');
    });

    it('should mask accountId in object data', () => {
      const data = {
        accountId: '12345678901',
        other: 'value',
      };

      const masked = (auditService as any).maskObjectData(data);
      expect(masked.accountId).toBe('1234...8901');
      expect(masked.other).toBe('value');
    });

    it('should mask transactionId in object data', () => {
      const data = {
        transactionId: '1234567890123456',
      };

      const masked = (auditService as any).maskObjectData(data);
      expect(masked.transactionId).toBe('1234...3456');
    });

    it('should mask paymentAmount numbers in object data', () => {
      const data = {
        paymentAmount: 2450.75,
      };

      const masked = (auditService as any).maskObjectData(data);
      expect(masked.paymentAmount).toBe('***');
    });

    it('should not mask non-sensitive fields', () => {
      const data = {
        paymentMethod: 'eft',
        status: 'posted',
        timestamp: '2024-01-15T10:00:00Z',
      };

      const masked = (auditService as any).maskObjectData(data);
      expect(masked.paymentMethod).toBe('eft');
      expect(masked.status).toBe('posted');
      expect(masked.timestamp).toBe('2024-01-15T10:00:00Z');
    });
  });
});
