import { Request, Response, NextFunction } from 'express';
import { initTraceContext } from '../utils/trace-context';
import { randomUUID } from 'crypto';

export function traceMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  // Extract user ID from JWT or authorization header (simplified - just using a placeholder)
  const authHeader = req.headers.authorization;
  const userId = authHeader ? 'user_from_jwt' : undefined;

  initTraceContext(traceId, userId);
  next();
}
