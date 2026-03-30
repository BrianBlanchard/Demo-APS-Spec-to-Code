import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestContext {
  traceId: string;
  startTime: number;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getTraceId(): string {
  const context = requestContext.getStore();
  return context?.traceId || 'unknown';
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
  const context: RequestContext = {
    traceId,
    startTime: Date.now(),
  };

  res.setHeader('x-trace-id', traceId);

  requestContext.run(context, () => {
    next();
  });
}
