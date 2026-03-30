import { Request, Response, NextFunction } from 'express';
import { asyncLocalStorage, RequestContext } from '../utils/async-local-storage';
import { generateTraceId } from '../utils/id-generator';

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();

  const context: RequestContext = {
    traceId,
    timestamp: new Date().toISOString(),
  };

  // Set trace ID in response header
  res.setHeader('X-Trace-Id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
}
