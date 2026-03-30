import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface TracingContext {
  traceId: string;
  timestamp: Date;
}

export const tracingStorage = new AsyncLocalStorage<TracingContext>();

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
  const context: TracingContext = {
    traceId,
    timestamp: new Date(),
  };

  res.setHeader('X-Trace-Id', traceId);

  tracingStorage.run(context, () => {
    next();
  });
}

export function getTraceId(): string {
  const context = tracingStorage.getStore();
  return context?.traceId || 'no-trace-id';
}

export function getTracingContext(): TracingContext | undefined {
  return tracingStorage.getStore();
}
