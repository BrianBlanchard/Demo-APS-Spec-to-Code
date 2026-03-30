import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../types/error.types';

// Mock authentication for demonstration purposes
// In production, this would validate JWT tokens
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Invalid or expired JWT token');
  }

  // Mock user extraction from token
  // In production, decode and validate JWT
  req.user = {
    id: 'USER123',
    role: 'CSR',
  };

  next();
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('User lacks permission to create customers');
    }

    next();
  };
};
