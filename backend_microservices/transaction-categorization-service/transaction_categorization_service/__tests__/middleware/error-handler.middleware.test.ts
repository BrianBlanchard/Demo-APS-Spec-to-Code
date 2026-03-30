import { Request, Response } from 'express';
import {
  AppError,
  CategoryNotFoundError,
  DatabaseError,
  errorHandler,
} from '../../src/middleware/error-handler.middleware';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('should create AppError with different status codes', () => {
      const statusCodes = [400, 401, 403, 404, 409, 500, 503];

      statusCodes.forEach((code) => {
        const error = new AppError(code, 'ERROR', 'Message');
        expect(error.statusCode).toBe(code);
      });
    });

    it('should capture stack trace', () => {
      const error = new AppError(500, 'ERROR', 'Message');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('CategoryNotFoundError', () => {
    it('should create CategoryNotFoundError with MCC', () => {
      const error = new CategoryNotFoundError('5411');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(CategoryNotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('CATEGORY_NOT_FOUND');
      expect(error.message).toBe('Category not found for MCC: 5411');
      expect(error.name).toBe('CategoryNotFoundError');
    });

    it('should handle different MCC values', () => {
      const mccs = ['0000', '5411', '5812', '9999'];

      mccs.forEach((mcc) => {
        const error = new CategoryNotFoundError(mcc);
        expect(error.message).toBe(`Category not found for MCC: ${mcc}`);
      });
    });

    it('should have correct error code', () => {
      const error = new CategoryNotFoundError('5411');
      expect(error.errorCode).toBe('CATEGORY_NOT_FOUND');
    });

    it('should have 404 status code', () => {
      const error = new CategoryNotFoundError('5411');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with message', () => {
      const error = new DatabaseError('Connection failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('DatabaseError');
    });

    it('should handle different error messages', () => {
      const messages = [
        'Connection timeout',
        'Query failed',
        'Transaction rollback',
        'Connection pool exhausted',
      ];

      messages.forEach((message) => {
        const error = new DatabaseError(message);
        expect(error.message).toBe(message);
      });
    });

    it('should have correct error code', () => {
      const error = new DatabaseError('Error');
      expect(error.errorCode).toBe('DATABASE_ERROR');
    });

    it('should have 500 status code', () => {
      const error = new DatabaseError('Error');
      expect(error.statusCode).toBe(500);
    });
  });
});

describe('errorHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/api/v1/transactions/categorize',
      method: 'POST',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      getHeader: jest.fn().mockReturnValue('test-trace-id'),
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('AppError handling', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'TEST_ERROR',
          message: 'Test error',
          traceId: 'test-trace-id',
        })
      );
    });

    it('should handle CategoryNotFoundError', () => {
      const error = new CategoryNotFoundError('5411');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'CATEGORY_NOT_FOUND',
          message: 'Category not found for MCC: 5411',
        })
      );
    });

    it('should handle DatabaseError', () => {
      const error = new DatabaseError('Connection failed');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'DATABASE_ERROR',
          message: 'Connection failed',
        })
      );
    });

    it('should include timestamp in error response', () => {
      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include traceId from response header', () => {
      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.traceId).toBe('test-trace-id');
    });
  });

  describe('Generic Error handling', () => {
    it('should handle generic Error as internal server error', () => {
      const error = new Error('Unexpected error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        })
      );
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Type error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
        })
      );
    });

    it('should handle RangeError', () => {
      const error = new RangeError('Range error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should mask original error message in generic errors', () => {
      const error = new Error('Sensitive database connection string: user:pass@host');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toBe('An unexpected error occurred');
      expect(callArgs.message).not.toContain('user:pass@host');
    });
  });

  describe('TraceId handling', () => {
    it('should use traceId from header when available', () => {
      (mockResponse.getHeader as jest.Mock).mockReturnValue('custom-trace-id');

      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.traceId).toBe('custom-trace-id');
    });

    it('should use "unknown" when traceId is not available', () => {
      (mockResponse.getHeader as jest.Mock).mockReturnValue(undefined);

      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.traceId).toBe('unknown');
    });

    it('should handle empty string traceId', () => {
      (mockResponse.getHeader as jest.Mock).mockReturnValue('');

      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.traceId).toBe('unknown');
    });
  });

  describe('Error response structure', () => {
    it('should return response with all required fields', () => {
      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveProperty('errorCode');
      expect(callArgs).toHaveProperty('message');
      expect(callArgs).toHaveProperty('timestamp');
      expect(callArgs).toHaveProperty('traceId');
    });

    it('should not include stack trace in response', () => {
      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('stack');
    });

    it('should not include sensitive error details', () => {
      const error = new Error('Database error: password=secret123');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).not.toContain('password');
      expect(callArgs.message).not.toContain('secret123');
    });
  });

  describe('Next function', () => {
    it('should not call next function', () => {
      const error = new AppError(400, 'ERROR', 'Message');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
