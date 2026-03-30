import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setContext } from '../utils/context';
import { RequestContext } from '../types/request-context';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const userId = (req as any).user?.userId || 'anonymous';
  const role = (req as any).user?.role || 'guest';
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const context: RequestContext = {
    traceId,
    userId,
    role,
    ipAddress,
    timestamp: new Date(),
  };

  setContext(context);

  // Add traceId to response headers
  res.setHeader('x-trace-id', traceId);

  next();
}
