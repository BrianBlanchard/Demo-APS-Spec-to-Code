import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../validation.middleware';
import { z, ZodError } from 'zod';

describe('validation.middleware', () => {
  const TestSchema = z.object({
    name: z.string(),
    age: z.number().min(0),
  });

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('validateRequest', () => {
    it('should call next() when validation passes', () => {
      mockRequest.body = { name: 'John', age: 30 };

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should call next(error) when validation fails', () => {
      mockRequest.body = { name: 'John', age: -5 };

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should call next(error) when required field is missing', () => {
      mockRequest.body = { name: 'John' };

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should call next(error) when field type is invalid', () => {
      mockRequest.body = { name: 'John', age: 'thirty' };

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should handle empty body', () => {
      mockRequest.body = {};

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should handle null body', () => {
      mockRequest.body = null;

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should strip additional properties not in schema', () => {
      mockRequest.body = { name: 'John', age: 30, extra: 'field' };

      const middleware = validateRequest(TestSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should validate complex nested schemas', () => {
      const ComplexSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        tags: z.array(z.string()),
      });

      mockRequest.body = {
        user: { name: 'John', email: 'john@example.com' },
        tags: ['tag1', 'tag2'],
      };

      const middleware = validateRequest(ComplexSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should fail validation for invalid nested schema', () => {
      const ComplexSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      mockRequest.body = {
        user: { name: 'John', email: 'invalid-email' },
      };

      const middleware = validateRequest(ComplexSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });
});
