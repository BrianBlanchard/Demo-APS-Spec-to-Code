import { Request, Response, NextFunction } from 'express';
import { AsyncContext } from '../context/async-context';

export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  AsyncContext.run(() => {
    // Capture IP address
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
    AsyncContext.setIpAddress(ipAddress);

    // Add traceId to response headers
    res.setHeader('X-Trace-Id', AsyncContext.getTraceId());

    next();
  });
}
