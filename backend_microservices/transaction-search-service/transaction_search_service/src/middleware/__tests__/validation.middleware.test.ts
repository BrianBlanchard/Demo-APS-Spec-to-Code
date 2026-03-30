import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../validation.middleware';

describe('ValidationMiddleware - Middleware Layer', () => {
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

  it('should pass validation for valid data', () => {
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

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.body).toEqual({ name: 'John', age: 30 });
  });

  it('should call next with error for invalid data', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    mockRequest.body = {
      name: 'John',
      age: 'not a number',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should transform data according to schema', () => {
    const schema = z.object({
      count: z.string().transform((val) => parseInt(val, 10)),
    });

    mockRequest.body = {
      count: '42',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body.count).toBe(42);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle required fields', () => {
    const schema = z.object({
      requiredField: z.string(),
      optionalField: z.string().optional(),
    });

    mockRequest.body = {
      optionalField: 'value',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    });

    mockRequest.body = {
      user: {
        name: 'John',
        email: 'john@example.com',
      },
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});
