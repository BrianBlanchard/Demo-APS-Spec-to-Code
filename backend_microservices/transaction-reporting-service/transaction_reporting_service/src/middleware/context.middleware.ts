import { Request, Response, NextFunction } from 'express';
import { runWithContext } from '../utils/async-context';
import { generateTraceId } from '../utils/id-generator';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();

  res.setHeader('x-trace-id', traceId);

  runWithContext(
    {
      traceId,
      timestamp: new Date(),
    },
    () => {
      next();
    }
  );
}
