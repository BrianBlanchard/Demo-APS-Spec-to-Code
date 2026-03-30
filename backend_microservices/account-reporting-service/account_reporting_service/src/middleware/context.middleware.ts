import { Request, Response, NextFunction } from 'express';
import { asyncContext, RequestContext } from '../utils/async-context';
import { generateTraceId } from '../utils/id-generator';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers?.['x-trace-id'] as string) || generateTraceId();
  const timestamp = new Date().toISOString();

  const context: RequestContext = {
    traceId,
    timestamp,
  };

  res.setHeader('X-Trace-Id', traceId);

  asyncContext.run(context, () => {
    next();
  });
}
