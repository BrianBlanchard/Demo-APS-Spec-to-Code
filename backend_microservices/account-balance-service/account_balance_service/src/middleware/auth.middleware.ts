import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../types/error.types';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    accountId?: string;
    role?: string;
  };
}

export const jwtAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
    }) as { userId: string; accountId?: string; role?: string };

    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const internalServiceAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const serviceToken = req.headers['x-service-token'] as string;

  if (!serviceToken || serviceToken !== config.jwt.secret) {
    throw new UnauthorizedError('Invalid service token');
  }

  next();
};
