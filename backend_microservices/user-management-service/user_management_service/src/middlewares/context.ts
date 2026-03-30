import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '../models/types';

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const contextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  const adminId = req.headers['x-admin-id'] as string | undefined;

  const context: RequestContext = {
    traceId,
    timestamp: new Date(),
    ipAddress,
    adminId,
  };

  res.setHeader('X-Trace-Id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
};

export const getContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore();
};
