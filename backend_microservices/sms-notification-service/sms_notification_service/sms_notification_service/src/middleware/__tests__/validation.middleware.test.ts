import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../validation.middleware';
import { ValidationError } from '../../types/errors';

describe('validateRequest middleware', () => {
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

  describe('valid requests', () => {
    it('should call next() when request body is valid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 30 };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle complex nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        preferences: z.array(z.string()),
      });

      mockRequest.body = {
        user: { name: 'Jane', email: 'jane@example.com' },
        preferences: ['email', 'sms'],
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle optional fields correctly', () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      mockRequest.body = { required: 'value' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalid requests', () => {
    it('should call next() with ValidationError when validation fails', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 'invalid' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('age');
    });

    it('should include field path in error message', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      mockRequest.body = { user: { email: 'invalid-email' } };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('user.email');
    });

    it('should handle missing required fields', () => {
      const schema = z.object({
        required: z.string(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('required');
    });

    it('should handle multiple validation errors', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      mockRequest.body = { name: 123, age: 'invalid', email: 'not-an-email' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('name');
      expect(error.message).toContain('age');
      expect(error.message).toContain('email');
    });

    it('should handle array validation errors', () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      mockRequest.body = { tags: ['valid', 123, 'also-valid'] };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty body when schema expects fields', () => {
      const schema = z.object({
        field: z.string(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should handle null body', () => {
      const schema = z.object({
        field: z.string(),
      });

      mockRequest.body = null;

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should handle undefined body', () => {
      const schema = z.object({
        field: z.string(),
      });

      mockRequest.body = undefined;

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should not modify the original request body', () => {
      const schema = z.object({
        name: z.string(),
      });

      const originalBody = { name: 'John' };
      mockRequest.body = { ...originalBody };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual(originalBody);
    });

    it('should handle non-ZodError exceptions', () => {
      const schema = z.object({
        field: z.string(),
      });

      // Force a non-Zod error by mocking
      const originalParse = schema.parse;
      schema.parse = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      mockRequest.body = { field: 'value' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Unexpected error');

      schema.parse = originalParse;
    });
  });

  describe('schema types', () => {
    it('should work with string validation', () => {
      const schema = z.object({
        text: z.string().min(5).max(10),
      });

      mockRequest.body = { text: 'abc' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work with number validation', () => {
      const schema = z.object({
        value: z.number().min(0).max(100),
      });

      mockRequest.body = { value: 150 };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work with enum validation', () => {
      const schema = z.object({
        status: z.enum(['active', 'inactive']),
      });

      mockRequest.body = { status: 'pending' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work with regex pattern validation', () => {
      const schema = z.object({
        phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
      });

      mockRequest.body = { phone: '1234567890' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});
