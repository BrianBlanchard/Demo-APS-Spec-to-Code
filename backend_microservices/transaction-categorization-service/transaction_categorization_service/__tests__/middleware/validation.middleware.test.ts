import { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../src/middleware/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      getHeader: jest.fn().mockReturnValue('test-trace-id'),
    };

    mockNext = jest.fn();
  });

  describe('Valid requests', () => {
    it('should call next() for valid request', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'John',
        age: 30,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should pass validation for complex nested schema', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        metadata: z.object({
          timestamp: z.string(),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        metadata: {
          timestamp: '2024-01-15T10:30:00.000Z',
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass validation for array schema', () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      mockRequest.body = {
        items: ['item1', 'item2', 'item3'],
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass validation for optional fields', () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      mockRequest.body = {
        required: 'value',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Invalid requests', () => {
    it('should return 400 for invalid request', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'John',
        age: 'invalid',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation errors in response', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'John',
        age: 'invalid',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          errors: expect.any(Array),
        })
      );
    });

    it('should include field name in validation error', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      mockRequest.body = {
        email: 'invalid-email',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors).toHaveLength(1);
      expect(callArgs.errors[0].field).toBe('email');
    });

    it('should handle missing required fields', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string(),
      });

      mockRequest.body = {
        name: 'John',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });

    it('should handle multiple validation errors', () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().positive(),
        email: z.string().email(),
      });

      mockRequest.body = {
        name: 'AB',
        age: -1,
        email: 'invalid',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle nested field validation errors', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          age: 'invalid',
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors[0].field).toBe('user.age');
    });
  });

  describe('Response format', () => {
    it('should include errorCode in response', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should include message in response', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toBe('Request validation failed');
    });

    it('should include timestamp in response', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include traceId from response header', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.traceId).toBe('test-trace-id');
    });

    it('should include errors array with field and message', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123,
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ])
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty request body', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle null request body', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = null;

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle schema with custom error messages', () => {
      const schema = z.object({
        age: z.number({ invalid_type_error: 'Age must be a number' }),
      });

      mockRequest.body = {
        age: 'not a number',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.errors[0].message).toBe('Age must be a number');
    });

    it('should handle schema with refinements', () => {
      const schema = z
        .object({
          password: z.string(),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });

      mockRequest.body = {
        password: 'pass123',
        confirmPassword: 'pass456',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle schemas with transformations', () => {
      const schema = z.object({
        amount: z.string().transform((val) => parseFloat(val)),
      });

      mockRequest.body = {
        amount: '123.45',
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
