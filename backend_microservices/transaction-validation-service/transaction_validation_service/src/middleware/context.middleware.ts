import { Request, Response, NextFunction } from 'express';
import { asyncLocalStorage, RequestContext } from '../config/context.config';
import { generateTraceId } from '../utils/id-generator.util';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();
  const context: RequestContext = {
    traceId,
    startTime: Date.now(),
  };

  res.setHeader('X-Trace-Id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
}
