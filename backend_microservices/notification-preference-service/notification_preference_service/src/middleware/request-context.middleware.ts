import { Request, Response, NextFunction } from 'express';
import { runWithContext } from '../utils/request-context';

export const requestContextMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  runWithContext(() => {
    next();
  });
};
