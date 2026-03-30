import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../error.middleware';
import {
  AppError,
  ValidationError,
  CustomerOptedOutError,
  SmsDeliveryError,
  TwilioApiError,
} from '../../types/errors';
import * as tracingMiddleware from '../tracing.middleware';
import * as loggerService from '../../services/logger.service';

jest.mock('../tracing.middleware');
jest.mock('../../services/logger.service');

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockGetTraceId: jest.SpyInstance;
  let mockLogger: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      path: '/api/test',
      method: 'POST',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    mockGetTraceId = jest.spyOn(tracingMiddleware, 'getTraceId');
    mockGetTraceId.mockReturnValue('test-trace-id-123');

    mockLogger = jest.spyOn(loggerService.logger, 'error');
    mockLogger.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError handling', () => {
    it('should handle ValidationError with correct status and response', () => {
      const error = new ValidationError('Invalid phone number format');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid phone number format',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should handle CustomerOptedOutError with correct status and response', () => {
      const error = new CustomerOptedOutError('Customer has opted out');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'CUSTOMER_OPTED_OUT',
        message: 'Customer has opted out',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should handle SmsDeliveryError with correct status and response', () => {
      const error = new SmsDeliveryError('Failed to send SMS');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'SMS_DELIVERY_ERROR',
        message: 'Failed to send SMS',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should handle TwilioApiError with correct status and response', () => {
      const error = new TwilioApiError('Twilio API unavailable');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'TWILIO_API_ERROR',
        message: 'Twilio API unavailable',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should handle generic AppError with custom status code', () => {
      const error = new AppError('CUSTOM_ERROR', 'Custom error message', 418);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'CUSTOM_ERROR',
        message: 'Custom error message',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });
  });

  describe('Unknown error handling', () => {
    it('should handle generic Error with 500 status', () => {
      const error = new Error('Unexpected error occurred');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should mask sensitive error details for unknown errors', () => {
      const error = new Error('Database connection failed: password=secret123');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toBe('An unexpected error occurred');
      expect(jsonCall.message).not.toContain('secret123');
      expect(jsonCall.message).not.toContain('password');
    });

    it('should handle non-Error objects', () => {
      const error = { someProperty: 'value' };

      errorMiddleware(error as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: expect.any(String),
        traceId: 'test-trace-id-123',
      });
    });

    it('should handle string errors', () => {
      const error = 'String error message';

      errorMiddleware(error as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle null error', () => {
      const error = null;

      errorMiddleware(error as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle undefined error', () => {
      const error = undefined;

      errorMiddleware(error as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('logging', () => {
    it('should log error with trace context for AppError', () => {
      const error = new ValidationError('Validation failed');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger).toHaveBeenCalledWith(
        {
          err: error,
          traceId: 'test-trace-id-123',
          path: '/api/test',
          method: 'POST',
        },
        'Request error'
      );
    });

    it('should log error with trace context for unknown errors', () => {
      const error = new Error('Unknown error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger).toHaveBeenCalledWith(
        {
          err: error,
          traceId: 'test-trace-id-123',
          path: '/api/test',
          method: 'POST',
        },
        'Request error'
      );
    });

    it('should log with correct request path and method', () => {
      const customRequest: Partial<Request> = {
        path: '/api/v1/notifications/sms',
        method: 'POST',
      };

      const error = new SmsDeliveryError('SMS failed');

      errorMiddleware(error, customRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/notifications/sms',
          method: 'POST',
        }),
        'Request error'
      );
    });
  });

  describe('trace ID handling', () => {
    it('should include trace ID in error response', () => {
      mockGetTraceId.mockReturnValue('custom-trace-id-456');

      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.traceId).toBe('custom-trace-id-456');
    });

    it('should handle missing trace ID gracefully', () => {
      mockGetTraceId.mockReturnValue('no-trace-id');

      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.traceId).toBe('no-trace-id');
    });
  });

  describe('timestamp handling', () => {
    it('should include ISO8601 timestamp in error response', () => {
      const error = new ValidationError('Test error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should generate different timestamps for sequential errors', async () => {
      const error1 = new ValidationError('Test error 1');
      const error2 = new ValidationError('Test error 2');

      errorMiddleware(error1, mockRequest as Request, mockResponse as Response, mockNext);
      const timestamp1 = (mockResponse.json as jest.Mock).mock.calls[0][0].timestamp;

      await new Promise((resolve) => setTimeout(resolve, 2));

      mockResponse.json = jest.fn().mockReturnThis();
      errorMiddleware(error2, mockRequest as Request, mockResponse as Response, mockNext);
      const timestamp2 = (mockResponse.json as jest.Mock).mock.calls[0][0].timestamp;

      expect(timestamp1).not.toBe(timestamp2);
    });
  });

  describe('response format consistency', () => {
    it('should always return response with all required fields', () => {
      const errors = [
        new ValidationError('Test'),
        new CustomerOptedOutError('Test'),
        new SmsDeliveryError('Test'),
        new TwilioApiError('Test'),
        new Error('Test'),
      ];

      errors.forEach((error) => {
        mockResponse.json = jest.fn().mockReturnThis();

        errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

        const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall).toHaveProperty('errorCode');
        expect(jsonCall).toHaveProperty('message');
        expect(jsonCall).toHaveProperty('timestamp');
        expect(jsonCall).toHaveProperty('traceId');
        expect(Object.keys(jsonCall).length).toBe(4);
      });
    });
  });
});
