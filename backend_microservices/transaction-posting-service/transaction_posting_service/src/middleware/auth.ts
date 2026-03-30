import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (token !== config.auth.serviceToken) {
    throw new UnauthorizedError();
  }

  next();
}
