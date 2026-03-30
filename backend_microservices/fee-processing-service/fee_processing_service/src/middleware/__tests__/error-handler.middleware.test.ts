import { Request, Response, NextFunction } from 'express';
import {
  errorHandlerMiddleware,
  AppError,
  NotFoundError,
  ValidationError,
  BusinessError,
} from '../error-handler.middleware';
import { ZodError } from 'zod';
import { requestContextStorage } from '../../utils/request-context';
import { RequestContext } from '../../types/request-context';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      path: '/api/v1/fees/assess',
      method: 'POST',
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('AppError');
    });

    it('should handle AppError in middleware', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new AppError(400, 'TEST_ERROR', 'Test error message');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'TEST_ERROR',
            message: 'Test error message',
            traceId: 'test-trace-id',
            timestamp: expect.any(String),
          })
        );
      });
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle NotFoundError in middleware', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new NotFoundError('Account not found: 12345678901');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'NOT_FOUND',
            message: 'Account not found: 12345678901',
          })
        );
      });
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should handle ValidationError in middleware', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new ValidationError('Account ID must be 11 digits');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'VALIDATION_ERROR',
            message: 'Account ID must be 11 digits',
          })
        );
      });
    });
  });

  describe('BusinessError', () => {
    it('should create BusinessError with 422 status', () => {
      const error = new BusinessError('Business rule violation');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('BUSINESS_ERROR');
      expect(error.message).toBe('Business rule violation');
      expect(error.name).toBe('BusinessError');
    });

    it('should handle BusinessError in middleware', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new BusinessError('Account is not active');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(422);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'BUSINESS_ERROR',
            message: 'Account is not active',
          })
        );
      });
    });
  });

  describe('ZodError Handling', () => {
    it('should handle ZodError with validation messages', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const zodError = new ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['accountId'],
            message: 'Expected string, received number',
          },
        ]);

        errorHandlerMiddleware(
          zodError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'VALIDATION_ERROR',
            message: expect.stringContaining('accountId'),
            traceId: 'test-trace-id',
          })
        );
      });
    });

    it('should handle multiple ZodError issues', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const zodError = new ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['accountId'],
            message: 'Expected string',
          },
          {
            code: 'too_small',
            minimum: 1,
            type: 'string',
            inclusive: true,
            exact: false,
            path: ['reason'],
            message: 'Required',
          },
        ]);

        errorHandlerMiddleware(
          zodError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        const call = jsonMock.mock.calls[0][0];
        expect(call.message).toContain('accountId');
        expect(call.message).toContain('reason');
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unknown errors with 500 status', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new Error('Unexpected error');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            traceId: 'test-trace-id',
            timestamp: expect.any(String),
          })
        );
      });
    });

    it('should mask error details for generic errors', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new Error('Database connection failed with credentials');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        const call = jsonMock.mock.calls[0][0];
        expect(call.message).not.toContain('Database');
        expect(call.message).toBe('An unexpected error occurred');
      });
    });

    it('should handle error without context', () => {
      const error = new Error('Test error');

      errorHandlerMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
          traceId: 'no-trace-id',
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should include all required fields in error response', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new NotFoundError('Not found');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const call = jsonMock.mock.calls[0][0];
        expect(call).toHaveProperty('errorCode');
        expect(call).toHaveProperty('message');
        expect(call).toHaveProperty('timestamp');
        expect(call).toHaveProperty('traceId');
      });
    });

    it('should format timestamp as ISO string', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new AppError(400, 'TEST', 'Test');

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const call = jsonMock.mock.calls[0][0];
        expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        errorHandlerMiddleware(
          null as unknown as Error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(500);
      });
    });

    it('should handle error with no message', () => {
      const context: RequestContext = {
        traceId: 'test-trace-id',
        timestamp: new Date(),
      };

      requestContextStorage.run(context, () => {
        const error = new Error();

        errorHandlerMiddleware(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'An unexpected error occurred',
          })
        );
      });
    });
  });
});
