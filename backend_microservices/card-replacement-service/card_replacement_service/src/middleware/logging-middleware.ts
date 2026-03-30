import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { getTraceId } from '../utils/trace-context';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const traceId = getTraceId();

  logger.info(
    {
      traceId,
      method: req.method,
      url: req.url,
      path: req.path,
    },
    'Incoming request',
  );

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      {
        traceId,
        method: req.method,
        url: req.url,
        path: req.path,
        statusCode: res.statusCode,
        duration,
      },
      'Request completed',
    );
  });

  next();
}
