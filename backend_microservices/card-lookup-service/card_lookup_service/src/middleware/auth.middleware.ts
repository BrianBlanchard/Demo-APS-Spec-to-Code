import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  if (!token) {
    throw new UnauthorizedException('Missing JWT token');
  }

  // In production, validate JWT token here
  // For now, we assume the token is valid and extract user info from headers
  next();
}
