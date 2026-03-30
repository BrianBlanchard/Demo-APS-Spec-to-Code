import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { setRequestContext } from '../config/async-context.config';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers?.['x-trace-id'] as string) || randomUUID();
  const timestamp = new Date().toISOString();

  setRequestContext({ traceId, timestamp });

  res.setHeader('x-trace-id', traceId);

  next();
};
