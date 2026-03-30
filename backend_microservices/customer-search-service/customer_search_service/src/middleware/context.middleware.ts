import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContext } from '../types/context.types';

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
  const userId = (req.headers['x-user-id'] as string) || undefined;
  const userRole = (req.headers['x-user-role'] as string) || undefined;

  const context: RequestContext = {
    traceId,
    userId,
    userRole,
    timestamp: new Date(),
  };

  res.setHeader('x-trace-id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
