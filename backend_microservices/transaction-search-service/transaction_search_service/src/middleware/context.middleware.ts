import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContextStorage } from '../utils/context.storage';
import { RequestContext } from '../types';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

  const context: RequestContext = {
    traceId,
    userId: req.headers['x-user-id'] as string | undefined,
    timestamp: new Date().toISOString(),
  };

  res.setHeader('x-trace-id', traceId);

  requestContextStorage.run(context, () => {
    next();
  });
}
