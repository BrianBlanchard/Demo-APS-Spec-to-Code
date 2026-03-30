import { SendSmsRequestSchema } from '../sms.dto';
import { MessageType, Priority } from '../../types/enums';

describe('SendSmsRequestSchema', () => {
  describe('valid requests', () => {
    it('should validate a valid fraud alert request', () => {
      const validRequest = {
        to: '+13125550123',
        messageType: MessageType.FRAUD_ALERT,
        message: 'ALERT: Large transaction detected.',
        priority: Priority.CRITICAL,
      };

      const result = SendSmsRequestSchema.safeParse(validRequest);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should validate a valid OTP request', () => {
      const validRequest = {
        to: '+14155552345',
        messageType: MessageType.OTP,
        message: 'Your verification code is 123456.',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(validRequest);

      expect(result.success).toBe(true);
    });

    it('should validate international phone numbers in E.164 format', () => {
      const internationalNumbers = [
        '+442071234567',  // UK
        '+33123456789',   // France
        '+81312345678',   // Japan
        '+61234567890',   // Australia
        '+919876543210',  // India
      ];

      internationalNumbers.forEach((phoneNumber) => {
        const request = {
          to: phoneNumber,
          messageType: MessageType.OTP,
          message: 'Test message',
          priority: Priority.MEDIUM,
        };

        const result = SendSmsRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should validate message at maximum length (1600 characters)', () => {
      const longMessage = 'A'.repeat(1600);
      const request = {
        to: '+13125550123',
        messageType: MessageType.TRANSACTION_CONFIRMATION,
        message: longMessage,
        priority: Priority.LOW,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(true);
    });

    it('should validate all message types', () => {
      const messageTypes = [
        MessageType.FRAUD_ALERT,
        MessageType.OTP,
        MessageType.TRANSACTION_CONFIRMATION,
        MessageType.ACCOUNT_STATUS,
      ];

      messageTypes.forEach((messageType) => {
        const request = {
          to: '+13125550123',
          messageType,
          message: 'Test message',
          priority: Priority.MEDIUM,
        };

        const result = SendSmsRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });

    it('should validate all priority levels', () => {
      const priorities = [
        Priority.CRITICAL,
        Priority.HIGH,
        Priority.MEDIUM,
        Priority.LOW,
      ];

      priorities.forEach((priority) => {
        const request = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test message',
          priority,
        };

        const result = SendSmsRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid phone numbers', () => {
    it('should reject phone number without plus sign', () => {
      const request = {
        to: '13125550123',
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('E.164 format');
      }
    });

    it('should reject phone number starting with +0', () => {
      const request = {
        to: '+0123456789',
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject phone number that is too short', () => {
      const request = {
        to: '+1',
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject phone number that is too long', () => {
      const request = {
        to: '+12345678901234567',
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject phone number with invalid characters', () => {
      const invalidNumbers = [
        '+1312-555-0123',
        '+1 312 555 0123',
        '+1(312)5550123',
        '+1312.555.0123',
      ];

      invalidNumbers.forEach((phoneNumber) => {
        const request = {
          to: phoneNumber,
          messageType: MessageType.OTP,
          message: 'Test message',
          priority: Priority.HIGH,
        };

        const result = SendSmsRequestSchema.safeParse(request);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('invalid message content', () => {
    it('should reject empty message', () => {
      const request = {
        to: '+13125550123',
        messageType: MessageType.OTP,
        message: '',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot be empty');
      }
    });

    it('should reject message exceeding 1600 characters', () => {
      const tooLongMessage = 'A'.repeat(1601);
      const request = {
        to: '+13125550123',
        messageType: MessageType.OTP,
        message: tooLongMessage,
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('exceeds SMS limit');
      }
    });
  });

  describe('invalid message type', () => {
    it('should reject invalid message type', () => {
      const request = {
        to: '+13125550123',
        messageType: 'invalid_type',
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });
  });

  describe('invalid priority', () => {
    it('should reject invalid priority', () => {
      const request = {
        to: '+13125550123',
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: 'invalid_priority',
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });
  });

  describe('missing required fields', () => {
    it('should reject request missing "to" field', () => {
      const request = {
        messageType: MessageType.OTP,
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject request missing "messageType" field', () => {
      const request = {
        to: '+13125550123',
        message: 'Test message',
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject request missing "message" field', () => {
      const request = {
        to: '+13125550123',
        messageType: MessageType.OTP,
        priority: Priority.HIGH,
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject request missing "priority" field', () => {
      const request = {
        to: '+13125550123',
        messageType: MessageType.OTP,
        message: 'Test message',
      };

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should reject completely empty request', () => {
      const request = {};

      const result = SendSmsRequestSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
