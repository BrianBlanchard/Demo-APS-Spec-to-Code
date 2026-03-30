import { z } from 'zod';
import {
  EmailPriority,
  EmailStatus,
  SendEmailRequestSchema,
  SendEmailResponse,
  ErrorResponse,
  EmailPriorityType,
  EmailStatusType,
} from '../email-notification.dto';

describe('Email Notification DTOs', () => {
  describe('EmailPriority', () => {
    it('should have correct priority values', () => {
      expect(EmailPriority.HIGH).toBe('high');
      expect(EmailPriority.NORMAL).toBe('normal');
      expect(EmailPriority.LOW).toBe('low');
    });

    it('should contain exactly three priority levels', () => {
      const priorities = Object.values(EmailPriority);
      expect(priorities).toHaveLength(3);
      expect(priorities).toContain('high');
      expect(priorities).toContain('normal');
      expect(priorities).toContain('low');
    });
  });

  describe('EmailStatus', () => {
    it('should have correct status values', () => {
      expect(EmailStatus.SENT).toBe('sent');
      expect(EmailStatus.FAILED).toBe('failed');
      expect(EmailStatus.QUEUED).toBe('queued');
      expect(EmailStatus.RETRYING).toBe('retrying');
    });

    it('should contain exactly four status values', () => {
      const statuses = Object.values(EmailStatus);
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('sent');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('queued');
      expect(statuses).toContain('retrying');
    });
  });

  describe('SendEmailRequestSchema', () => {
    describe('valid requests', () => {
      it('should validate a complete valid request', () => {
        const validRequest = {
          to: 'customer@example.com',
          templateId: 'payment_confirmation',
          templateData: {
            customerName: 'John Doe',
            amount: 100.50,
          },
          priority: 'high',
        };

        const result = SendEmailRequestSchema.parse(validRequest);

        expect(result).toEqual(validRequest);
      });

      it('should apply default priority when not provided', () => {
        const request = {
          to: 'customer@example.com',
          templateId: 'payment_confirmation',
          templateData: {},
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(result.priority).toBe('normal');
      });

      it('should accept empty templateData object', () => {
        const request = {
          to: 'customer@example.com',
          templateId: 'test_template',
          templateData: {},
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(result.templateData).toEqual({});
      });

      it('should accept all priority levels', () => {
        const baserequest = {
          to: 'test@example.com',
          templateId: 'test',
          templateData: {},
        };

        const highPriority = SendEmailRequestSchema.parse({ ...baserequest, priority: 'high' });
        expect(highPriority.priority).toBe('high');

        const normalPriority = SendEmailRequestSchema.parse({ ...baserequest, priority: 'normal' });
        expect(normalPriority.priority).toBe('normal');

        const lowPriority = SendEmailRequestSchema.parse({ ...baserequest, priority: 'low' });
        expect(lowPriority.priority).toBe('low');
      });

      it('should accept complex nested templateData', () => {
        const request = {
          to: 'test@example.com',
          templateId: 'complex_template',
          templateData: {
            user: {
              name: 'John',
              address: {
                street: '123 Main St',
                city: 'New York',
              },
            },
            items: [1, 2, 3],
            meta: { timestamp: '2024-01-01' },
          },
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(result.templateData).toEqual(request.templateData);
      });
    });

    describe('invalid requests', () => {
      it('should reject invalid email format', () => {
        const invalidRequest = {
          to: 'not-an-email',
          templateId: 'test',
          templateData: {},
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject missing email', () => {
        const invalidRequest = {
          templateId: 'test',
          templateData: {},
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject empty email', () => {
        const invalidRequest = {
          to: '',
          templateId: 'test',
          templateData: {},
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject missing templateId', () => {
        const invalidRequest = {
          to: 'test@example.com',
          templateData: {},
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject empty templateId', () => {
        const invalidRequest = {
          to: 'test@example.com',
          templateId: '',
          templateData: {},
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject missing templateData', () => {
        const invalidRequest = {
          to: 'test@example.com',
          templateId: 'test',
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject invalid priority value', () => {
        const invalidRequest = {
          to: 'test@example.com',
          templateId: 'test',
          templateData: {},
          priority: 'urgent',
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should reject null templateData', () => {
        const invalidRequest = {
          to: 'test@example.com',
          templateId: 'test',
          templateData: null,
        };

        expect(() => SendEmailRequestSchema.parse(invalidRequest)).toThrow(z.ZodError);
      });

      it('should provide detailed error messages', () => {
        const invalidRequest = {
          to: 'invalid-email',
          templateId: '',
          templateData: {},
        };

        try {
          SendEmailRequestSchema.parse(invalidRequest);
          fail('Should have thrown validation error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.errors.length).toBeGreaterThan(0);
          expect(zodError.errors.some(e => e.path.includes('to'))).toBe(true);
          expect(zodError.errors.some(e => e.path.includes('templateId'))).toBe(true);
        }
      });
    });

    describe('edge cases', () => {
      it('should handle email with special characters', () => {
        const request = {
          to: 'user+tag@sub.example.co.uk',
          templateId: 'test',
          templateData: {},
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(result.to).toBe('user+tag@sub.example.co.uk');
      });

      it('should handle very long templateId', () => {
        const longTemplateId = 'a'.repeat(1000);
        const request = {
          to: 'test@example.com',
          templateId: longTemplateId,
          templateData: {},
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(result.templateId).toBe(longTemplateId);
      });

      it('should handle large templateData object', () => {
        const largeData: Record<string, unknown> = {};
        for (let i = 0; i < 100; i++) {
          largeData[`field${i}`] = `value${i}`;
        }

        const request = {
          to: 'test@example.com',
          templateId: 'test',
          templateData: largeData,
        };

        const result = SendEmailRequestSchema.parse(request);

        expect(Object.keys(result.templateData).length).toBe(100);
      });
    });
  });

  describe('Type Guards', () => {
    it('should correctly type EmailPriorityType', () => {
      const priority: EmailPriorityType = 'high';
      expect(['high', 'normal', 'low']).toContain(priority);
    });

    it('should correctly type EmailStatusType', () => {
      const status: EmailStatusType = 'sent';
      expect(['sent', 'failed', 'queued', 'retrying']).toContain(status);
    });
  });

  describe('SendEmailResponse interface', () => {
    it('should match expected structure', () => {
      const response: SendEmailResponse = {
        notificationId: 'EMAIL-20240327-TEST',
        status: 'sent',
        sentAt: '2024-03-27T14:30:05Z',
      };

      expect(response.notificationId).toBe('EMAIL-20240327-TEST');
      expect(response.status).toBe('sent');
      expect(response.sentAt).toBe('2024-03-27T14:30:05Z');
    });
  });

  describe('ErrorResponse interface', () => {
    it('should match expected structure with all fields', () => {
      const error: ErrorResponse = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid request',
        timestamp: '2024-03-27T14:30:05Z',
        traceId: 'abc123',
      };

      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid request');
      expect(error.timestamp).toBe('2024-03-27T14:30:05Z');
      expect(error.traceId).toBe('abc123');
    });

    it('should allow optional traceId', () => {
      const error: ErrorResponse = {
        errorCode: 'TEST_ERROR',
        message: 'Test message',
        timestamp: '2024-03-27T14:30:05Z',
      };

      expect(error.traceId).toBeUndefined();
    });
  });
});
