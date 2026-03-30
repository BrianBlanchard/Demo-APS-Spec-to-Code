import { Request, Response, NextFunction } from 'express';
import { asyncLocalStorage, createContext } from '../utils/context.util';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const traceId = (req.headers['x-trace-id'] as string) || undefined;
  const context = createContext(traceId);

  res.setHeader('x-trace-id', context.traceId);

  asyncLocalStorage.run(context, () => {
    next();
  });
};
