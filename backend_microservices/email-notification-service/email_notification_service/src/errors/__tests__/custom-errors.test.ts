import {
  AppError,
  ValidationError,
  NotFoundError,
  EmailDeliveryError,
  TemplateError,
  ExternalServiceError,
} from '../custom-errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError(500, 'TEST_ERROR', 'Test message', true);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should default isOperational to true', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');

      expect(error.isOperational).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError(500, 'TEST_ERROR', 'Test message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should allow non-operational errors', () => {
      const error = new AppError(500, 'CRITICAL_ERROR', 'Critical failure', false);

      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom error code', () => {
      const error = new ValidationError('Invalid email', 'INVALID_EMAIL');

      expect(error.errorCode).toBe('INVALID_EMAIL');
      expect(error.message).toBe('Invalid email');
    });

    it('should have correct name', () => {
      const error = new ValidationError('Test');

      expect(error.name).toBe('ValidationError');
    });

    it('should handle empty message', () => {
      const error = new ValidationError('');

      expect(error.message).toBe('');
    });

    it('should handle complex validation messages', () => {
      const message = 'to: Invalid email format, templateId: Required field missing';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom error code', () => {
      const error = new NotFoundError('Template not found', 'TEMPLATE_NOT_FOUND');

      expect(error.errorCode).toBe('TEMPLATE_NOT_FOUND');
      expect(error.message).toBe('Template not found');
    });

    it('should have correct name', () => {
      const error = new NotFoundError('Test');

      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('EmailDeliveryError', () => {
    it('should create email delivery error with 500 status', () => {
      const error = new EmailDeliveryError('Failed to send email');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(EmailDeliveryError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('EMAIL_DELIVERY_FAILED');
      expect(error.message).toBe('Failed to send email');
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom error code', () => {
      const error = new EmailDeliveryError('Retry limit exceeded', 'MAX_RETRIES_EXCEEDED');

      expect(error.errorCode).toBe('MAX_RETRIES_EXCEEDED');
      expect(error.message).toBe('Retry limit exceeded');
    });

    it('should have correct name', () => {
      const error = new EmailDeliveryError('Test');

      expect(error.name).toBe('EmailDeliveryError');
    });

    it('should handle detailed error messages', () => {
      const message = 'Failed to send email after 3 attempts: SendGrid API timeout';
      const error = new EmailDeliveryError(message);

      expect(error.message).toBe(message);
    });
  });

  describe('TemplateError', () => {
    it('should create template error with 400 status', () => {
      const error = new TemplateError('Template processing failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(TemplateError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEMPLATE_ERROR');
      expect(error.message).toBe('Template processing failed');
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom error code', () => {
      const error = new TemplateError('Missing required fields', 'MISSING_TEMPLATE_FIELDS');

      expect(error.errorCode).toBe('MISSING_TEMPLATE_FIELDS');
      expect(error.message).toBe('Missing required fields');
    });

    it('should have correct name', () => {
      const error = new TemplateError('Test');

      expect(error.name).toBe('TemplateError');
    });

    it('should handle field-specific messages', () => {
      const message = 'Missing required template fields: customerName, amount';
      const error = new TemplateError(message);

      expect(error.message).toBe(message);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with 502 status', () => {
      const error = new ExternalServiceError('External service unavailable');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ExternalServiceError);
      expect(error.statusCode).toBe(502);
      expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toBe('External service unavailable');
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom error code', () => {
      const error = new ExternalServiceError('SendGrid API error', 'SENDGRID_ERROR');

      expect(error.errorCode).toBe('SENDGRID_ERROR');
      expect(error.message).toBe('SendGrid API error');
    });

    it('should have correct name', () => {
      const error = new ExternalServiceError('Test');

      expect(error.name).toBe('ExternalServiceError');
    });

    it('should handle service-specific errors', () => {
      const message = 'Failed to send email: SendGrid API rate limit exceeded';
      const error = new ExternalServiceError(message, 'SENDGRID_RATE_LIMIT');

      expect(error.message).toBe(message);
      expect(error.errorCode).toBe('SENDGRID_RATE_LIMIT');
    });
  });

  describe('Error hierarchy', () => {
    it('should maintain inheritance chain', () => {
      const errors = [
        new ValidationError('test'),
        new NotFoundError('test'),
        new EmailDeliveryError('test'),
        new TemplateError('test'),
        new ExternalServiceError('test'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      });
    });

    it('should differentiate between error types', () => {
      const validation = new ValidationError('test');
      const notFound = new NotFoundError('test');
      const delivery = new EmailDeliveryError('test');

      expect(validation).not.toBeInstanceOf(NotFoundError);
      expect(notFound).not.toBeInstanceOf(ValidationError);
      expect(delivery).not.toBeInstanceOf(ValidationError);
    });
  });

  describe('Error properties', () => {
    it('should have unique status codes', () => {
      const errors = [
        new ValidationError('test'),
        new NotFoundError('test'),
        new EmailDeliveryError('test'),
        new TemplateError('test'),
        new ExternalServiceError('test'),
      ];

      const statusCodes = errors.map(e => e.statusCode);
      const uniqueCodes = new Set([400, 404, 500, 502]);

      statusCodes.forEach(code => {
        expect(uniqueCodes.has(code)).toBe(true);
      });
    });

    it('should have unique default error codes', () => {
      const errors = [
        new ValidationError('test'),
        new NotFoundError('test'),
        new EmailDeliveryError('test'),
        new TemplateError('test'),
        new ExternalServiceError('test'),
      ];

      const errorCodes = errors.map(e => e.errorCode);
      const uniqueErrorCodes = new Set(errorCodes);

      expect(uniqueErrorCodes.size).toBe(5);
    });

    it('should all be operational by default', () => {
      const errors = [
        new ValidationError('test'),
        new NotFoundError('test'),
        new EmailDeliveryError('test'),
        new TemplateError('test'),
        new ExternalServiceError('test'),
      ];

      errors.forEach(error => {
        expect(error.isOperational).toBe(true);
      });
    });
  });

  describe('Error serialization', () => {
    it('should serialize error properties', () => {
      const error = new ValidationError('Invalid input');
      const json = JSON.stringify(error);

      expect(json).toContain('VALIDATION_ERROR');
      expect(json).toContain('400');
    });

    it('should preserve error properties', () => {
      const error = new EmailDeliveryError('Delivery failed');

      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('EMAIL_DELIVERY_FAILED');
      expect(error.message).toBe('Delivery failed');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('Stack trace', () => {
    it('should capture correct stack trace for each error type', () => {
      const errors = [
        new ValidationError('test'),
        new NotFoundError('test'),
        new EmailDeliveryError('test'),
        new TemplateError('test'),
        new ExternalServiceError('test'),
      ];

      errors.forEach(error => {
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
        expect(error.stack!.length).toBeGreaterThan(0);
      });
    });
  });
});
