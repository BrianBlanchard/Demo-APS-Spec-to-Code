import { updateNotificationPreferenceSchema } from '../../src/types/notification-preference.dto';

describe('Notification Preference DTOs', () => {
  describe('updateNotificationPreferenceSchema', () => {
    it('should validate valid complete preferences', () => {
      const validData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email', 'sms'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate minimal preferences', () => {
      const validData = {
        emailEnabled: false,
        smsEnabled: false,
        transactionAlerts: {
          enabled: false,
          threshold: 0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: false,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: false,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing emailEnabled field', () => {
      const invalidData = {
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative threshold', () => {
      const invalidData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: -100,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid channel type', () => {
      const invalidData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['invalid-channel'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty channels array', () => {
      const invalidData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: [],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept multiple channels', () => {
      const validData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email', 'sms', 'push'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email', 'push'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept zero threshold', () => {
      const validData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept large threshold values', () => {
      const validData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 999999.99,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required nested fields', () => {
      const invalidData = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          channels: ['email'],
          // missing threshold
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
