import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          errors: validationErrors,
          timestamp: new Date().toISOString(),
          traceId: res.getHeader('X-Trace-ID'),
        });
        return;
      }
      next(error);
    }
  };
};
