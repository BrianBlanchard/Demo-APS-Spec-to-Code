import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { asyncLocalStorage } from '../utils/async-context';
import { RequestContext } from '../types/context.types';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  const context: RequestContext = {
    traceId,
    userId: req.headers['x-user-id'] as string | undefined,
    timestamp: new Date(),
  };

  res.setHeader('x-trace-id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
};
