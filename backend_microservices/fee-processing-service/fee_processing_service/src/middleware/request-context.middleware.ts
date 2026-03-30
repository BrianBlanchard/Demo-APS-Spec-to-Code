import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '../utils/request-context';
import { RequestContext } from '../types/request-context';

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  const context: RequestContext = {
    traceId,
    timestamp: new Date(),
  };

  res.setHeader('x-trace-id', traceId);

  requestContextStorage.run(context, () => {
    next();
  });
}
