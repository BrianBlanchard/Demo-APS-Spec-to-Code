import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/request-context.type';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../types/user-role.type';

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function traceContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const userId = (req.headers['x-user-id'] as string) || 'anonymous';
  const userRole = (req.headers['x-user-role'] as UserRole) || UserRole.CUSTOMER;

  const context: RequestContext = {
    traceId,
    userId,
    userRole,
    timestamp: new Date(),
  };

  res.setHeader('x-trace-id', traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
}

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
