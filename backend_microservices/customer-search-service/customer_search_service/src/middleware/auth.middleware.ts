import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../types/error.types';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  // In production, validate JWT token here
  // For now, extract user info from headers
  const userRole = req.headers['x-user-role'] as string;

  if (!userRole) {
    throw new UnauthorizedError('User role not found');
  }

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.headers['x-user-role'] as string;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}
