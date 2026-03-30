import { Request, Response, NextFunction } from 'express';
import { runWithTracing, generateTraceId, TracingContext } from '../utils/tracing';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();

  const context: TracingContext = {
    traceId,
    userId: (req as any).user?.userId,
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
  };

  res.setHeader('X-Trace-Id', traceId);

  runWithTracing(context, () => {
    next();
  });
}
