import { describe, it, expect } from '@jest/globals';
import {
  ApplicationError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ReportGenerationError,
} from '../errors';

describe('Error Classes', () => {
  describe('ApplicationError', () => {
    it('should create error with all properties', () => {
      const error = new ApplicationError('TEST_ERROR', 'Test message', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ApplicationError');
    });

    it('should default to status code 500', () => {
      const error = new ApplicationError('SERVER_ERROR', 'Internal error');

      expect(error.statusCode).toBe(500);
    });

    it('should capture stack trace', () => {
      const error = new ApplicationError('STACK_TEST', 'Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApplicationError');
    });

    it('should handle different status codes', () => {
      const codes = [400, 401, 403, 404, 500, 503];

      codes.forEach((statusCode) => {
        const error = new ApplicationError('ERROR', 'Message', statusCode);
        expect(error.statusCode).toBe(statusCode);
      });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should have correct error code', () => {
      const error = new ValidationError('Field is required');

      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should have 400 status code', () => {
      const error = new ValidationError('Validation failed');

      expect(error.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should have correct error code', () => {
      const error = new NotFoundError('Item does not exist');

      expect(error.errorCode).toBe('NOT_FOUND');
    });

    it('should have 404 status code', () => {
      const error = new NotFoundError('Not found');

      expect(error.statusCode).toBe(404);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Connection failed');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('DatabaseError');
    });

    it('should have correct error code', () => {
      const error = new DatabaseError('Query failed');

      expect(error.errorCode).toBe('DATABASE_ERROR');
    });

    it('should have 503 status code', () => {
      const error = new DatabaseError('Database unavailable');

      expect(error.statusCode).toBe(503);
    });
  });

  describe('ReportGenerationError', () => {
    it('should create report generation error', () => {
      const error = new ReportGenerationError('Failed to generate report');

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toBeInstanceOf(ReportGenerationError);
      expect(error.errorCode).toBe('REPORT_GENERATION_ERROR');
      expect(error.message).toBe('Failed to generate report');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ReportGenerationError');
    });

    it('should have correct error code', () => {
      const error = new ReportGenerationError('Generation failed');

      expect(error.errorCode).toBe('REPORT_GENERATION_ERROR');
    });

    it('should have 500 status code', () => {
      const error = new ReportGenerationError('Error during generation');

      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error inheritance', () => {
    it('should allow catching as Error', () => {
      const error = new ValidationError('Test');

      expect(error instanceof Error).toBe(true);
    });

    it('should allow catching as ApplicationError', () => {
      const errors = [
        new ValidationError('Test1'),
        new NotFoundError('Test2'),
        new DatabaseError('Test3'),
        new ReportGenerationError('Test4'),
      ];

      errors.forEach((error) => {
        expect(error instanceof ApplicationError).toBe(true);
      });
    });

    it('should differentiate between error types', () => {
      const validationError = new ValidationError('Test');
      const notFoundError = new NotFoundError('Test');

      expect(validationError instanceof ValidationError).toBe(true);
      expect(validationError instanceof NotFoundError).toBe(false);
      expect(notFoundError instanceof NotFoundError).toBe(true);
      expect(notFoundError instanceof ValidationError).toBe(false);
    });
  });

  describe('Error message handling', () => {
    it('should preserve error message', () => {
      const message = 'Detailed error message with context';
      const error = new ApplicationError('CODE', message);

      expect(error.message).toBe(message);
    });

    it('should handle empty message', () => {
      const error = new ApplicationError('CODE', '');

      expect(error.message).toBe('');
    });

    it('should handle special characters in message', () => {
      const message = 'Error: field "name" is required (line: 42)';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
    });
  });
});
