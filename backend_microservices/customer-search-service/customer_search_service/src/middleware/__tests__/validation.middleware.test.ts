import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateQuery, validateBody } from '../validation.middleware';
import { ValidationError } from '../../types/error.types';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      body: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      query: z.string().min(2),
      limit: z.coerce.number().int().min(1).max(50).optional(),
    });

    it('should pass validation for valid query parameters', () => {
      mockRequest.query = {
        query: 'john smith',
        limit: '10',
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({
        query: 'john smith',
        limit: 10,
      });
    });

    it('should throw ValidationError for invalid query parameters', () => {
      mockRequest.query = {
        query: 'j', // Too short
      };

      const middleware = validateQuery(querySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });

    it('should include field name in error message', () => {
      mockRequest.query = {
        query: 'a',
      };

      const middleware = validateQuery(querySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(/query/);
    });

    it('should transform and coerce types', () => {
      mockRequest.query = {
        query: 'test',
        limit: '25',
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query.limit).toBe(25);
      expect(typeof mockRequest.query.limit).toBe('number');
    });

    it('should handle optional fields', () => {
      mockRequest.query = {
        query: 'test',
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.query.limit).toBeUndefined();
    });

    it('should throw ValidationError for out of range values', () => {
      mockRequest.query = {
        query: 'test',
        limit: '100', // Exceeds max of 50
      };

      const middleware = validateQuery(querySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });

    it('should handle multiple validation errors', () => {
      const schema = z.object({
        query: z.string().min(2),
        limit: z.coerce.number().int().min(1).max(50),
        offset: z.coerce.number().int().min(0),
      });

      mockRequest.query = {
        query: 'a', // Too short
        limit: '-5', // Below minimum
        offset: '-1', // Below minimum
      };

      const middleware = validateQuery(schema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });
  });

  describe('validateBody', () => {
    const bodySchema = z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      email: z.string().email(),
    });

    it('should pass validation for valid body', () => {
      mockRequest.body = {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
      };

      const middleware = validateBody(bodySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body.email).toBe('john.smith@example.com');
    });

    it('should throw ValidationError for invalid body', () => {
      mockRequest.body = {
        first_name: '',
        last_name: 'Smith',
        email: 'invalid-email',
      };

      const middleware = validateBody(bodySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required fields', () => {
      mockRequest.body = {
        first_name: 'John',
      };

      const middleware = validateBody(bodySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });

    it('should include field name in error message', () => {
      mockRequest.body = {
        first_name: 'John',
        last_name: 'Smith',
        email: 'not-an-email',
      };

      const middleware = validateBody(bodySchema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(/email/);
    });

    it('should handle nested objects', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          age: 30,
        },
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject extra unexpected fields with strict mode', () => {
      const schema = z.object({
        name: z.string(),
      }).strict();

      mockRequest.body = {
        name: 'John',
        extra: 'field',
      };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ValidationError);
    });
  });

  describe('Error handling', () => {
    it('should rethrow non-Zod errors', () => {
      // Mock schema.parse to throw non-Zod error
      const mockSchema = {
        parse: jest.fn(() => {
          throw new Error('Non-Zod error');
        }),
      };

      mockRequest.query = { test: 'value' };

      const middleware = validateQuery(mockSchema as any);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Non-Zod error');
      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow(ValidationError);
    });
  });
});
