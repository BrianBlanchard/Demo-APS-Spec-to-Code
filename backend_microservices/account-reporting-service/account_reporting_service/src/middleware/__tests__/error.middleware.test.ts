import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../error.middleware';
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
} from '../../errors/application.error';
import { z } from 'zod';
import { asyncContext, RequestContext } from '../../utils/async-context';

describe('error.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockRequest = {
      path: '/api/v1/reports/accounts',
      method: 'POST',
    };

    mockResponse = {
      status: statusSpy,
    };

    nextFunction = jest.fn();
  });

  describe('ApplicationError handling', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid input',
          timestamp: expect.any(String),
          traceId: expect.any(String),
        })
      );
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Report not found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'NOT_FOUND',
          message: 'Report not found',
        })
      );
    });

    it('should handle DatabaseError with 500 status', () => {
      const error = new DatabaseError('Database connection failed');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'DATABASE_ERROR',
          message: 'Database connection failed',
        })
      );
    });

    it('should use trace ID from context if available', (done) => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: '2024-01-31T10:30:00.000Z',
      };

      asyncContext.run(context, () => {
        const error = new ValidationError('Invalid input');

        errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            traceId: 'test-trace-123',
          })
        );
        done();
      });
    });
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with 400 status', () => {
      const TestSchema = z.object({
        name: z.string(),
        age: z.number().min(0),
      });

      try {
        TestSchema.parse({ name: 'John', age: -5 });
      } catch (error) {
        errorMiddleware(error as Error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusSpy).toHaveBeenCalledWith(400);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'VALIDATION_ERROR',
            message: expect.stringContaining('age'),
          })
        );
      }
    });

    it('should format multiple ZodError issues', () => {
      const TestSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      try {
        TestSchema.parse({ name: 123, age: 'invalid', email: 'invalid-email' });
      } catch (error) {
        errorMiddleware(error as Error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusSpy).toHaveBeenCalledWith(400);
        const callArgs = jsonSpy.mock.calls[0][0];
        expect(callArgs.message).toContain(',');
      }
    });
  });

  describe('Generic Error handling', () => {
    it('should handle generic Error with 500 status', () => {
      const error = new Error('Unexpected error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        })
      );
    });

    it('should mask original error message for generic errors', () => {
      const error = new Error('Sensitive database connection string leaked');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.message).toBe('An unexpected error occurred');
      expect(callArgs.message).not.toContain('Sensitive');
    });
  });

  describe('Error response format', () => {
    it('should include all required fields in error response', () => {
      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
          traceId: expect.any(String),
        })
      );
    });

    it('should generate valid ISO timestamp', () => {
      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should generate trace ID if not in context', () => {
      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.traceId).toBe('unknown');
    });
  });
});
