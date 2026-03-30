import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { getContext } from './context';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const context = getContext();
  const startTime = Date.now();

  // Log request
  logger.info(
    {
      traceId: context?.traceId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: context?.ipAddress,
    },
    'Incoming request'
  );

  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      {
        traceId: context?.traceId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      'Request completed'
    );
  });

  next();
};
