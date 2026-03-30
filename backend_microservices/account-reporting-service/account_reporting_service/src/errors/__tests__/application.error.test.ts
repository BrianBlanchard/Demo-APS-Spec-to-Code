import {
  ApplicationError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ReportGenerationError,
} from '../application.error';

describe('application.error', () => {
  describe('ApplicationError', () => {
    it('should create an error with code, message, and status code', () => {
      const error = new ApplicationError('TEST_ERROR', 'Test error message', 500);

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApplicationError');
    });

    it('should default to status code 500 if not provided', () => {
      const error = new ApplicationError('TEST_ERROR', 'Test error message');

      expect(error.statusCode).toBe(500);
    });

    it('should be an instance of Error', () => {
      const error = new ApplicationError('TEST_ERROR', 'Test error message');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new ApplicationError('TEST_ERROR', 'Test error message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApplicationError');
    });

    it('should support different status codes', () => {
      const error400 = new ApplicationError('BAD_REQUEST', 'Bad request', 400);
      const error404 = new ApplicationError('NOT_FOUND', 'Not found', 404);
      const error503 = new ApplicationError('SERVICE_UNAVAILABLE', 'Service unavailable', 503);

      expect(error400.statusCode).toBe(400);
      expect(error404.statusCode).toBe(404);
      expect(error503.statusCode).toBe(503);
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with correct defaults', () => {
      const error = new ValidationError('Invalid input');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should be an instance of ApplicationError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ApplicationError);
    });

    it('should be an instance of Error', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new ValidationError('Invalid input');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });

    it('should support various validation messages', () => {
      const error1 = new ValidationError('Date must be in YYYY-MM-DD format');
      const error2 = new ValidationError('Report type is required');
      const error3 = new ValidationError('Format must be csv, json, or pdf');

      expect(error1.message).toBe('Date must be in YYYY-MM-DD format');
      expect(error2.message).toBe('Report type is required');
      expect(error3.message).toBe('Format must be csv, json, or pdf');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with correct defaults', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should be an instance of ApplicationError', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(ApplicationError);
    });

    it('should be an instance of Error', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });

    it('should support various not found messages', () => {
      const error1 = new NotFoundError('Report not found');
      const error2 = new NotFoundError('Account not found');

      expect(error1.message).toBe('Report not found');
      expect(error2.message).toBe('Account not found');
    });
  });

  describe('DatabaseError', () => {
    it('should create a database error with correct defaults', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should be an instance of ApplicationError', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error).toBeInstanceOf(ApplicationError);
    });

    it('should be an instance of Error', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DatabaseError');
    });

    it('should support various database error messages', () => {
      const error1 = new DatabaseError('Failed to fetch account summary from database');
      const error2 = new DatabaseError('Failed to save report to database');
      const error3 = new DatabaseError('Connection pool exhausted');

      expect(error1.message).toBe('Failed to fetch account summary from database');
      expect(error2.message).toBe('Failed to save report to database');
      expect(error3.message).toBe('Connection pool exhausted');
    });
  });

  describe('ReportGenerationError', () => {
    it('should create a report generation error with correct defaults', () => {
      const error = new ReportGenerationError('Failed to generate report');

      expect(error.code).toBe('REPORT_GENERATION_ERROR');
      expect(error.message).toBe('Failed to generate report');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ReportGenerationError');
    });

    it('should be an instance of ApplicationError', () => {
      const error = new ReportGenerationError('Failed to generate report');

      expect(error).toBeInstanceOf(ApplicationError);
    });

    it('should be an instance of Error', () => {
      const error = new ReportGenerationError('Failed to generate report');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new ReportGenerationError('Failed to generate report');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ReportGenerationError');
    });

    it('should support various report generation error messages', () => {
      const error1 = new ReportGenerationError('Failed to generate report');
      const error2 = new ReportGenerationError('Report template not found');
      const error3 = new ReportGenerationError('Insufficient data for report generation');

      expect(error1.message).toBe('Failed to generate report');
      expect(error2.message).toBe('Report template not found');
      expect(error3.message).toBe('Insufficient data for report generation');
    });
  });

  describe('Error inheritance chain', () => {
    it('should maintain proper inheritance for ValidationError', () => {
      const error = new ValidationError('Invalid');

      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should maintain proper inheritance for NotFoundError', () => {
      const error = new NotFoundError('Not found');

      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should maintain proper inheritance for DatabaseError', () => {
      const error = new DatabaseError('DB error');

      expect(error instanceof DatabaseError).toBe(true);
      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should maintain proper inheritance for ReportGenerationError', () => {
      const error = new ReportGenerationError('Report error');

      expect(error instanceof ReportGenerationError).toBe(true);
      expect(error instanceof ApplicationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Error throwing and catching', () => {
    it('should be catchable when thrown', () => {
      expect(() => {
        throw new ApplicationError('TEST', 'Test message');
      }).toThrow(ApplicationError);
    });

    it('should preserve error details when caught', () => {
      try {
        throw new ValidationError('Invalid input');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('VALIDATION_ERROR');
        expect((error as ValidationError).message).toBe('Invalid input');
        expect((error as ValidationError).statusCode).toBe(400);
      }
    });
  });
});
