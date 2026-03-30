import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/error.middleware';
import { tracingMiddleware } from '../../src/middleware/tracing.middleware';
import { validateRequest } from '../../src/middleware/validation.middleware';
import { authMiddleware, authorizeRoles, AuthenticatedRequest } from '../../src/middleware/auth.middleware';
import { AppError, ValidationError, UnauthorizedError, ForbiddenError } from '../../src/types/error.types';
import { ZodError, z } from 'zod';

describe('Middleware Tests', () => {
  describe('errorHandler', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        method: 'POST',
        path: '/api/v1/customers',
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockNext = jest.fn();

      process.env.NODE_ENV = 'test';
    });

    it('should handle AppError with correct status code', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'TEST_ERROR',
          message: 'Test error message',
        })
      );
    });

    it('should handle ValidationError as 400', () => {
      const error = new ValidationError('Invalid input');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid input',
        })
      );
    });

    it('should handle ZodError and format validation errors', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      let zodError: ZodError;

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (err) {
        zodError = err as ZodError;
      }

      errorHandler(zodError!, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: expect.any(Array),
        })
      );
    });

    it('should handle generic Error as 500', () => {
      const error = new Error('Generic error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'INTERNAL_SERVER_ERROR',
        })
      );
    });

    it('should include timestamp in error response', () => {
      const error = new AppError(400, 'TEST', 'Test');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should include details in error response when provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new AppError(400, 'TEST', 'Test', details);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details,
        })
      );
    });

    it('should mask error message in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Sensitive database error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal Server Error',
        })
      );
    });
  });

  describe('tracingMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockResponse = {
        setHeader: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('should generate trace ID when not provided', () => {
      tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Trace-Id',
        expect.any(String)
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing trace ID from request header', () => {
      const existingTraceId = 'existing-trace-id-123';
      mockRequest.headers = { 'x-trace-id': existingTraceId };

      tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Trace-Id',
        existingTraceId
      );
    });

    it('should call next middleware', () => {
      tracingMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateRequest', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        body: {},
      };

      mockResponse = {};

      mockNext = jest.fn();
    });

    it('should pass validation with valid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 30 };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({ name: 'John', age: 30 });
    });

    it('should call next with error for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 'invalid' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should transform and validate data', () => {
      const schema = z.object({
        name: z.string().transform((val) => val.toUpperCase()),
        age: z.number(),
      });

      mockRequest.body = { name: 'john', age: 30 };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.name).toBe('JOHN');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('authMiddleware', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockResponse = {};

      mockNext = jest.fn();
    });

    it('should throw UnauthorizedError when no auth header', () => {
      expect(() => {
        authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when auth header does not start with Bearer', () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      expect(() => {
        authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedError);
    });

    it('should set user on request when valid Bearer token', () => {
      mockRequest.headers = { authorization: 'Bearer valid-token-123' };

      authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBeDefined();
      expect(mockRequest.user?.role).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next after successful authentication', () => {
      mockRequest.headers = { authorization: 'Bearer valid-token-123' };

      authMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('authorizeRoles', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        user: { id: 'USER123', role: 'CSR' },
      };

      mockResponse = {};

      mockNext = jest.fn();
    });

    it('should allow access when user has authorized role', () => {
      const middleware = authorizeRoles('ADMIN', 'CSR');

      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw ForbiddenError when user lacks required role', () => {
      mockRequest.user = { id: 'USER123', role: 'VIEWER' };
      const middleware = authorizeRoles('ADMIN', 'CSR');

      expect(() => {
        middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user is not set', () => {
      mockRequest.user = undefined;
      const middleware = authorizeRoles('ADMIN');

      expect(() => {
        middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenError);
    });

    it('should allow multiple roles', () => {
      const middleware = authorizeRoles('ADMIN', 'CSR', 'MANAGER');

      mockRequest.user = { id: 'USER1', role: 'MANAGER' };
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
