import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '../utils/logger';
import type { RequestContext } from '../types/request-context.types';

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
  const timestamp = new Date().toISOString();

  const context: RequestContext = {
    traceId,
    timestamp,
  };

  res.setHeader('X-Trace-ID', traceId);

  requestContextStorage.run(context, () => {
    next();
  });
};
