import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorMiddleware, AppError } from '../error.middleware';
import { requestContextStorage } from '../../utils/context.storage';
import { RequestContext } from '../../types';

describe('ErrorMiddleware - Exception/Error Handling', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      path: '/api/v1/transactions/search',
      method: 'POST',
    };

    mockResponse = {
      status: statusMock,
    };

    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(400, 'VALIDATION_ERROR', 'Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('AppError');
    });

    it('should be instanceof Error', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('errorMiddleware - ZodError handling', () => {
    it('should handle ZodError with status 400', () => {
      const context: RequestContext = {
        traceId: 'test-trace-123',
        timestamp: '2024-01-15T14:30:00Z',
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

        errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'VALIDATION_ERROR',
            message: expect.stringContaining('accountId'),
            traceId: 'test-trace-123',
          })
        );
      });
    });

    it('should format multiple Zod errors', () => {
      const context: RequestContext = {
        traceId: 'trace-multi',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const zodError = new ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['accountId'],
            message: 'Invalid type',
          },
          {
            code: 'too_small',
            minimum: 1,
            type: 'number',
            inclusive: true,
            exact: false,
            path: ['pagination', 'page'],
            message: 'Too small',
          },
        ]);

        errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, mockNext);

        const callArgs = jsonMock.mock.calls[0][0];
        expect(callArgs.message).toContain('accountId');
        expect(callArgs.message).toContain('pagination.page');
      });
    });
  });

  describe('errorMiddleware - AppError handling', () => {
    it('should handle AppError with custom status and code', () => {
      const context: RequestContext = {
        traceId: 'app-error-trace',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const appError = new AppError(403, 'FORBIDDEN', 'Access denied');

        errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'FORBIDDEN',
            message: 'Access denied',
            traceId: 'app-error-trace',
          })
        );
      });
    });

    it('should handle 401 Unauthorized error', () => {
      const appError = new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should handle 422 Unprocessable Entity error', () => {
      const appError = new AppError(422, 'INVALID_RANGE', 'Invalid date range');
      errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);
      expect(statusMock).toHaveBeenCalledWith(422);
    });
  });

  describe('errorMiddleware - Generic error handling', () => {
    it('should handle generic Error with status 500', () => {
      const context: RequestContext = {
        traceId: 'generic-error-trace',
        timestamp: '2024-01-15T14:30:00Z',
      };

      requestContextStorage.run(context, () => {
        const error = new Error('Something went wrong');

        errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            traceId: 'generic-error-trace',
          })
        );
      });
    });

    it('should mask error details in generic errors', () => {
      const error = new Error('Database password is abc123');
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.message).not.toContain('abc123');
      expect(callArgs.message).toBe('An unexpected error occurred');
    });

    it('should include timestamp in error response', () => {
      const error = new Error('Test error');
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(new Date(callArgs.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should return traceId unknown when no context', () => {
      const error = new Error('Test error');
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.traceId).toBe('unknown');
    });
  });
});
