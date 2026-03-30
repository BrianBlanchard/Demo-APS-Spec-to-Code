import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { asyncLocalStorage } from '../config/logger.config';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  asyncLocalStorage.run({ traceId }, () => {
    res.setHeader('X-Trace-Id', traceId);
    next();
  });
};
