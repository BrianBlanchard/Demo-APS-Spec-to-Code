import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContext, RequestContext } from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      userId?: string;
    }
  }
}

export const requestContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // Generate or extract trace ID
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  req.traceId = traceId;

  // Extract user ID from JWT or other auth mechanism (placeholder for now)
  const userId = req.headers['x-user-id'] as string | undefined;
  req.userId = userId;

  // Store context in AsyncLocalStorage
  const context: RequestContext = {
    traceId,
    userId,
  };

  requestContext.run(context, () => {
    next();
  });
};
