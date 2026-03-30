import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  errorMiddleware,
} from '../error.middleware';
import { setRequestContext } from '../../config/async-context.config';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();

    // Set request context for traceId
    setRequestContext({
      traceId: 'test-trace-id',
      timestamp: '2024-01-15T10:30:00Z',
    });
  });

  describe('AppError class', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.stack).toBeDefined();
    });

    it('should capture stack trace', () => {
      const error = new AppError(500, 'INTERNAL_ERROR', 'Internal error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('NotFoundError class', () => {
    it('should create a NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('PAYMENT_NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });

    it('should have correct error code for payment not found', () => {
      const error = new NotFoundError('Payment confirmation not found');

      expect(error.errorCode).toBe('PAYMENT_NOT_FOUND');
      expect(error.message).toBe('Payment confirmation not found');
    });
  });

  describe('ForbiddenError class', () => {
    it('should create a ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.name).toBe('ForbiddenError');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
    });

    it('should handle forbidden access message', () => {
      const error = new ForbiddenError('Forbidden - cannot access this payment');

      expect(error.errorCode).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden - cannot access this payment');
    });
  });

  describe('ValidationError class', () => {
    it('should create a ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    it('should handle validation error message', () => {
      const error = new ValidationError('Invalid confirmation number format');

      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid confirmation number format');
    });
  });

  describe('errorMiddleware', () => {
    it('should handle NotFoundError and return 404 response', () => {
      const error = new NotFoundError('Payment confirmation not found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'PAYMENT_NOT_FOUND',
          message: 'Payment confirmation not found',
          traceId: 'test-trace-id',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle ForbiddenError and return 403 response', () => {
      const error = new ForbiddenError('Forbidden - cannot access this payment');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'FORBIDDEN',
          message: 'Forbidden - cannot access this payment',
          traceId: 'test-trace-id',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle ValidationError and return 400 response', () => {
      const error = new ValidationError('Invalid confirmation number format');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid confirmation number format',
          traceId: 'test-trace-id',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle generic Error and return 500 response', () => {
      const error = new Error('Unexpected error occurred');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

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

    it('should include traceId from request context', () => {
      setRequestContext({
        traceId: 'custom-trace-id-123',
        timestamp: '2024-01-15T10:30:00Z',
      });

      const error = new NotFoundError('Not found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: 'custom-trace-id-123',
        })
      );
    });

    it('should use unknown traceId when context is not available', () => {
      // Clear context by setting undefined (simulating no context)
      const error = new NotFoundError('Not found');

      // Create new response mocks
      const newJsonMock = jest.fn();
      const newStatusMock = jest.fn().mockReturnValue({ json: newJsonMock });
      const newMockResponse = { status: newStatusMock };

      errorMiddleware(error, {} as Request, newMockResponse as any, mockNext);

      expect(newJsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          traceId: expect.any(String),
        })
      );
    });

    it('should return ISO 8601 formatted timestamp', () => {
      const error = new NotFoundError('Not found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should preserve error message from AppError', () => {
      const error = new AppError(418, 'TEAPOT_ERROR', 'I am a teapot');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(418);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'TEAPOT_ERROR',
          message: 'I am a teapot',
        })
      );
    });
  });
});
