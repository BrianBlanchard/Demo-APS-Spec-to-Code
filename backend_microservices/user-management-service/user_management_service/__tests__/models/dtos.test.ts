import {
  SuspendUserRequestSchema,
  SuspendUserResponse,
  ErrorResponse,
  HealthCheckResponse,
} from '../../src/models/dtos';
import { SuspensionReason } from '../../src/models/types';

describe('DTOs - SuspendUserRequestSchema', () => {
  describe('Valid requests', () => {
    it('should validate a valid temporary suspension request', () => {
      const validRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Multiple duplicate listings detected',
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should validate a valid permanent suspension request', () => {
      const validRequest = {
        suspension_reason: SuspensionReason.POLICY_VIOLATION,
        suspension_notes: 'Repeated violations of terms',
        duration_days: null,
        notify_user: false,
      };

      const result = SuspendUserRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should validate request with all suspension reasons', () => {
      const reasons = [
        SuspensionReason.FRAUD,
        SuspensionReason.POLICY_VIOLATION,
        SuspensionReason.SPAM,
        SuspensionReason.INAPPROPRIATE_CONTENT,
        SuspensionReason.SECURITY_CONCERN,
        SuspensionReason.OTHER,
      ];

      reasons.forEach((reason) => {
        const request = {
          suspension_reason: reason,
          suspension_notes: 'Test notes',
          duration_days: 7,
          notify_user: true,
        };

        const result = SuspendUserRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should validate request with minimum valid suspension_notes length', () => {
      const request = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'A',
        duration_days: 1,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate request with maximum valid suspension_notes length', () => {
      const request = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'A'.repeat(1000),
        duration_days: 1,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid requests', () => {
    it('should reject request with missing suspension_reason', () => {
      const invalidRequest = {
        suspension_notes: 'Test notes',
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with missing suspension_notes', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with missing notify_user', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test notes',
        duration_days: 30,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with empty suspension_notes', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: '',
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with suspension_notes exceeding max length', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'A'.repeat(1001),
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with invalid suspension_reason', () => {
      const invalidRequest = {
        suspension_reason: 'invalid_reason',
        suspension_notes: 'Test notes',
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with negative duration_days', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test notes',
        duration_days: -1,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with zero duration_days', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test notes',
        duration_days: 0,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with non-integer duration_days', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test notes',
        duration_days: 30.5,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject request with non-boolean notify_user', () => {
      const invalidRequest = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test notes',
        duration_days: 30,
        notify_user: 'yes',
      };

      const result = SuspendUserRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle duration_days as null', () => {
      const request = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test',
        duration_days: null,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration_days).toBeNull();
      }
    });

    it('should handle very long suspension_notes within limit', () => {
      const longNotes = 'A'.repeat(999);
      const request = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: longNotes,
        duration_days: 30,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should handle large positive duration_days', () => {
      const request = {
        suspension_reason: SuspensionReason.FRAUD,
        suspension_notes: 'Test',
        duration_days: 365000,
        notify_user: true,
      };

      const result = SuspendUserRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });
});

describe('DTOs - TypeScript Interfaces', () => {
  describe('SuspendUserResponse', () => {
    it('should accept valid SuspendUserResponse with suspended_until', () => {
      const response: SuspendUserResponse = {
        success: true,
        message: 'User suspended',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        suspended_until: new Date('2024-02-15T10:30:00Z'),
      };

      expect(response.success).toBe(true);
      expect(response.user_id).toBeDefined();
      expect(response.suspended_until).toBeInstanceOf(Date);
    });

    it('should accept valid SuspendUserResponse without suspended_until', () => {
      const response: SuspendUserResponse = {
        success: false,
        message: 'Failed',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        suspended_until: null,
      };

      expect(response.suspended_until).toBeNull();
    });
  });

  describe('ErrorResponse', () => {
    it('should accept valid ErrorResponse', () => {
      const error: ErrorResponse = {
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: '2024-01-16T10:30:00Z',
        traceId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      };

      expect(error.errorCode).toBe('USER_NOT_FOUND');
      expect(error.traceId).toBeDefined();
    });
  });

  describe('HealthCheckResponse', () => {
    it('should accept valid healthy response', () => {
      const health: HealthCheckResponse = {
        status: 'healthy',
        timestamp: '2024-01-16T10:30:00Z',
        service: 'user-management-service',
        version: '1.0.0',
        checks: {
          database: 'up',
        },
      };

      expect(health.status).toBe('healthy');
      expect(health.checks.database).toBe('up');
    });

    it('should accept valid unhealthy response', () => {
      const health: HealthCheckResponse = {
        status: 'unhealthy',
        timestamp: '2024-01-16T10:30:00Z',
        service: 'user-management-service',
        version: '1.0.0',
        checks: {
          database: 'down',
        },
      };

      expect(health.status).toBe('unhealthy');
      expect(health.checks.database).toBe('down');
    });
  });
});
