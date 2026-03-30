import { EmailNotification, EmailTemplate } from '../email-notification.entity';
import { EmailStatus, EmailPriority } from '../../dto/email-notification.dto';

describe('Email Notification Entities', () => {
  describe('EmailNotification entity', () => {
    it('should create a valid EmailNotification object', () => {
      const notification: EmailNotification = {
        id: 'EMAIL-20240327-ABC123',
        to: 'customer@example.com',
        templateId: 'payment_confirmation',
        templateData: {
          customerName: 'John Doe',
          amount: 100.50,
        },
        priority: EmailPriority.HIGH,
        status: EmailStatus.SENT,
        sentAt: new Date('2024-03-27T14:30:05Z'),
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date('2024-03-27T14:00:00Z'),
        updatedAt: new Date('2024-03-27T14:30:05Z'),
      };

      expect(notification.id).toBe('EMAIL-20240327-ABC123');
      expect(notification.to).toBe('customer@example.com');
      expect(notification.templateId).toBe('payment_confirmation');
      expect(notification.templateData).toEqual({ customerName: 'John Doe', amount: 100.50 });
      expect(notification.priority).toBe('high');
      expect(notification.status).toBe('sent');
      expect(notification.sentAt).toBeInstanceOf(Date);
      expect(notification.retryCount).toBe(0);
      expect(notification.errorMessage).toBeNull();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow null sentAt for queued emails', () => {
      const notification: EmailNotification = {
        id: 'EMAIL-20240327-XYZ789',
        to: 'customer@example.com',
        templateId: 'test_template',
        templateData: {},
        priority: EmailPriority.NORMAL,
        status: EmailStatus.QUEUED,
        sentAt: null,
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.sentAt).toBeNull();
      expect(notification.status).toBe('queued');
    });

    it('should allow error message for failed emails', () => {
      const notification: EmailNotification = {
        id: 'EMAIL-20240327-FAILED',
        to: 'customer@example.com',
        templateId: 'test_template',
        templateData: {},
        priority: EmailPriority.NORMAL,
        status: EmailStatus.FAILED,
        sentAt: null,
        retryCount: 3,
        errorMessage: 'SendGrid API error: Service unavailable',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.status).toBe('failed');
      expect(notification.retryCount).toBe(3);
      expect(notification.errorMessage).toBe('SendGrid API error: Service unavailable');
    });

    it('should support all priority levels', () => {
      const highPriority: EmailNotification = {
        id: '1',
        to: 'test@example.com',
        templateId: 'test',
        templateData: {},
        priority: EmailPriority.HIGH,
        status: EmailStatus.QUEUED,
        sentAt: null,
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const normalPriority: EmailNotification = {
        ...highPriority,
        id: '2',
        priority: EmailPriority.NORMAL,
      };

      const lowPriority: EmailNotification = {
        ...highPriority,
        id: '3',
        priority: EmailPriority.LOW,
      };

      expect(highPriority.priority).toBe('high');
      expect(normalPriority.priority).toBe('normal');
      expect(lowPriority.priority).toBe('low');
    });

    it('should support all status values', () => {
      const baseNotification = {
        id: '1',
        to: 'test@example.com',
        templateId: 'test',
        templateData: {},
        priority: EmailPriority.NORMAL,
        sentAt: null,
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const queued: EmailNotification = {
        ...baseNotification,
        status: EmailStatus.QUEUED,
      };

      const retrying: EmailNotification = {
        ...baseNotification,
        status: EmailStatus.RETRYING,
      };

      const sent: EmailNotification = {
        ...baseNotification,
        status: EmailStatus.SENT,
      };

      const failed: EmailNotification = {
        ...baseNotification,
        status: EmailStatus.FAILED,
      };

      expect(queued.status).toBe('queued');
      expect(retrying.status).toBe('retrying');
      expect(sent.status).toBe('sent');
      expect(failed.status).toBe('failed');
    });

    it('should handle complex templateData', () => {
      const complexData = {
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            city: 'New York',
            zip: '10001',
          },
        },
        transaction: {
          id: 'TXN-123',
          amount: 250.75,
          items: ['item1', 'item2'],
        },
      };

      const notification: EmailNotification = {
        id: 'EMAIL-TEST',
        to: 'test@example.com',
        templateId: 'complex_template',
        templateData: complexData,
        priority: EmailPriority.NORMAL,
        status: EmailStatus.QUEUED,
        sentAt: null,
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.templateData).toEqual(complexData);
    });

    it('should track retry count correctly', () => {
      const notification: EmailNotification = {
        id: 'EMAIL-RETRY',
        to: 'test@example.com',
        templateId: 'test',
        templateData: {},
        priority: EmailPriority.NORMAL,
        status: EmailStatus.RETRYING,
        sentAt: null,
        retryCount: 2,
        errorMessage: 'Temporary failure',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.retryCount).toBe(2);
      expect(notification.status).toBe('retrying');
    });
  });

  describe('EmailTemplate entity', () => {
    it('should create a valid EmailTemplate object', () => {
      const template: EmailTemplate = {
        id: 'tmpl-123',
        templateId: 'payment_confirmation',
        subject: 'Payment Confirmation - {{confirmationNumber}}',
        htmlContent: '<html><body>Hello {{customerName}}</body></html>',
        textContent: 'Hello {{customerName}}',
        requiredFields: ['customerName', 'confirmationNumber'],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      expect(template.id).toBe('tmpl-123');
      expect(template.templateId).toBe('payment_confirmation');
      expect(template.subject).toContain('{{confirmationNumber}}');
      expect(template.htmlContent).toContain('{{customerName}}');
      expect(template.textContent).toContain('{{customerName}}');
      expect(template.requiredFields).toHaveLength(2);
      expect(template.requiredFields).toContain('customerName');
      expect(template.requiredFields).toContain('confirmationNumber');
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should support templates with no required fields', () => {
      const template: EmailTemplate = {
        id: 'tmpl-simple',
        templateId: 'simple_template',
        subject: 'Simple Subject',
        htmlContent: '<html><body>Static content</body></html>',
        textContent: 'Static content',
        requiredFields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.requiredFields).toHaveLength(0);
      expect(template.requiredFields).toEqual([]);
    });

    it('should support templates with multiple required fields', () => {
      const template: EmailTemplate = {
        id: 'tmpl-complex',
        templateId: 'transaction_alert',
        subject: 'Transaction Alert',
        htmlContent: '<p>{{field1}} {{field2}} {{field3}} {{field4}}</p>',
        textContent: '{{field1}} {{field2}} {{field3}} {{field4}}',
        requiredFields: ['field1', 'field2', 'field3', 'field4'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.requiredFields).toHaveLength(4);
      expect(template.requiredFields).toEqual(['field1', 'field2', 'field3', 'field4']);
    });

    it('should handle HTML and text content separately', () => {
      const template: EmailTemplate = {
        id: 'tmpl-dual',
        templateId: 'dual_format',
        subject: 'Test',
        htmlContent: '<html><body><h1>HTML Version</h1><p>Rich {{content}}</p></body></html>',
        textContent: 'Plain text version with {{content}}',
        requiredFields: ['content'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.htmlContent).toContain('<html>');
      expect(template.htmlContent).toContain('<h1>');
      expect(template.textContent).not.toContain('<html>');
      expect(template.textContent).toContain('Plain text');
    });

    it('should support long template content', () => {
      const longHtmlContent = '<html><body>' + 'Lorem ipsum '.repeat(1000) + '</body></html>';
      const longTextContent = 'Lorem ipsum '.repeat(1000);

      const template: EmailTemplate = {
        id: 'tmpl-long',
        templateId: 'long_template',
        subject: 'Long Template',
        htmlContent: longHtmlContent,
        textContent: longTextContent,
        requiredFields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.htmlContent.length).toBeGreaterThan(10000);
      expect(template.textContent.length).toBeGreaterThan(10000);
    });

    it('should preserve template placeholder syntax', () => {
      const template: EmailTemplate = {
        id: 'tmpl-placeholders',
        templateId: 'placeholder_test',
        subject: '{{type}} Notification for {{userName}}',
        htmlContent: '<p>Dear {{userName}}, your {{type}} is {{status}}</p>',
        textContent: 'Dear {{userName}}, your {{type}} is {{status}}',
        requiredFields: ['userName', 'type', 'status'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.subject).toMatch(/\{\{type\}\}/);
      expect(template.subject).toMatch(/\{\{userName\}\}/);
      expect(template.htmlContent).toMatch(/\{\{userName\}\}/);
      expect(template.htmlContent).toMatch(/\{\{type\}\}/);
      expect(template.htmlContent).toMatch(/\{\{status\}\}/);
    });

    it('should track creation and update timestamps', () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 86400000);

      const template: EmailTemplate = {
        id: 'tmpl-timestamps',
        templateId: 'timestamp_test',
        subject: 'Test',
        htmlContent: '<p>Test</p>',
        textContent: 'Test',
        requiredFields: [],
        createdAt: earlier,
        updatedAt: now,
      };

      expect(template.createdAt.getTime()).toBeLessThan(template.updatedAt.getTime());
    });
  });

  describe('Entity relationships', () => {
    it('should link notification to template via templateId', () => {
      const template: EmailTemplate = {
        id: 'tmpl-1',
        templateId: 'payment_confirmation',
        subject: 'Payment Confirmation',
        htmlContent: '<p>Test</p>',
        textContent: 'Test',
        requiredFields: ['amount'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const notification: EmailNotification = {
        id: 'EMAIL-1',
        to: 'test@example.com',
        templateId: template.templateId,
        templateData: { amount: 100 },
        priority: EmailPriority.NORMAL,
        status: EmailStatus.SENT,
        sentAt: new Date(),
        retryCount: 0,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.templateId).toBe(template.templateId);
    });
  });
});
