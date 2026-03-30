import { StatusUpdateRequestSchema } from '../../../src/dtos/status-update-request.dto';
import { AccountStatus } from '../../../src/enums/account-status.enum';
import { StatusChangeReason } from '../../../src/enums/status-change-reason.enum';

describe('StatusUpdateRequest DTO', () => {
  describe('Valid inputs', () => {
    it('should validate a complete valid request', () => {
      const validRequest = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notes: 'Test notes',
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate request without optional notes', () => {
      const validRequest = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notifyCustomer: false,
      };

      const result = StatusUpdateRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept all valid status values', () => {
      Object.values(AccountStatus).forEach((status) => {
        const request = {
          newStatus: status,
          reason: StatusChangeReason.SYSTEM_MAINTENANCE,
          notifyCustomer: true,
        };
        const result = StatusUpdateRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid reason codes', () => {
      Object.values(StatusChangeReason).forEach((reason) => {
        const request = {
          newStatus: AccountStatus.SUSPENDED,
          reason: reason,
          notifyCustomer: true,
        };
        const result = StatusUpdateRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should accept notes up to 500 characters', () => {
      const validRequest = {
        newStatus: AccountStatus.INACTIVE,
        reason: StatusChangeReason.ACCOUNT_UPGRADE,
        notes: 'a'.repeat(500),
        notifyCustomer: false,
      };

      const result = StatusUpdateRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject missing newStatus', () => {
      const invalidRequest = {
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing reason', () => {
      const invalidRequest = {
        newStatus: AccountStatus.SUSPENDED,
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing notifyCustomer', () => {
      const invalidRequest = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status value', () => {
      const invalidRequest = {
        newStatus: 'invalid_status',
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid reason code', () => {
      const invalidRequest = {
        newStatus: AccountStatus.SUSPENDED,
        reason: 'invalid_reason',
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject notes exceeding 500 characters', () => {
      const invalidRequest = {
        newStatus: AccountStatus.INACTIVE,
        reason: StatusChangeReason.ACCOUNT_UPGRADE,
        notes: 'a'.repeat(501),
        notifyCustomer: false,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid notifyCustomer type', () => {
      const invalidRequest = {
        newStatus: AccountStatus.SUSPENDED,
        reason: StatusChangeReason.FRAUD_INVESTIGATION,
        notifyCustomer: 'yes',
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty notes string', () => {
      const validRequest = {
        newStatus: AccountStatus.ACTIVE,
        reason: StatusChangeReason.CUSTOMER_REQUEST,
        notes: '',
        notifyCustomer: true,
      };

      const result = StatusUpdateRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject null values for required fields', () => {
      const invalidRequest = {
        newStatus: null,
        reason: null,
        notifyCustomer: null,
      };

      const result = StatusUpdateRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
