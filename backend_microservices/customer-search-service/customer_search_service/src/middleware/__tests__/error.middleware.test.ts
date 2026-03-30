import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../error.middleware';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  InternalServerError,
} from '../../types/error.types';
import { asyncLocalStorage } from '../context.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle AppError and return error response', () => {
    const error = new ValidationError('Invalid input');
    const traceId = 'test-trace-id';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: expect.any(String),
        traceId: 'test-trace-id',
      });
    });
  });

  it('should handle UnauthorizedError with correct status code', () => {
    const error = new UnauthorizedError('Invalid credentials');
    const traceId = 'trace-123';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          traceId: 'trace-123',
        })
      );
    });
  });

  it('should handle unknown errors as internal server error', () => {
    const error = new Error('Unknown error');
    const traceId = 'trace-456';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: expect.any(String),
        traceId: 'trace-456',
      });
    });
  });

  it('should use "unknown" traceId when context is not available', () => {
    const error = new ValidationError('Test error');

    errorMiddleware(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: 'unknown',
      })
    );
  });

  it('should include timestamp in ISO format', () => {
    const error = new ValidationError('Test error');
    const traceId = 'trace-789';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  it('should handle InternalServerError', () => {
    const error = new InternalServerError('Database connection failed');
    const traceId = 'trace-internal';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        })
      );
    });
  });

  it('should not call next function', () => {
    const error = new ValidationError('Test');
    const traceId = 'trace-test';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  it('should handle errors with special characters in message', () => {
    const error = new ValidationError('Error: "special" <characters> & symbols');
    const traceId = 'trace-special';

    asyncLocalStorage.run({ traceId, timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error: "special" <characters> & symbols',
        })
      );
    });
  });

  it('should preserve operational flag from AppError', () => {
    const error = new AppError('CUSTOM_ERROR', 'Custom message', 500, false);

    expect(error.isOperational).toBe(false);

    asyncLocalStorage.run({ traceId: 'trace', timestamp: new Date() }, () => {
      errorMiddleware(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
