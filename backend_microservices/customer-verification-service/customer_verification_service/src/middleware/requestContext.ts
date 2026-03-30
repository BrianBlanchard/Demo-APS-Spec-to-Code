import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  traceId: string;
  requestId: string;
  timestamp: Date;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const requestId = uuidv4();

  const context: RequestContext = {
    traceId,
    requestId,
    timestamp: new Date(),
  };

  req.headers['x-trace-id'] = traceId;
  res.setHeader('x-trace-id', traceId);

  requestContextStorage.run(context, () => {
    next();
  });
};

export const getRequestContext = (): RequestContext | undefined => {
  return requestContextStorage.getStore();
};
