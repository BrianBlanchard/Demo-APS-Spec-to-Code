import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../exceptions/AppError';
import { UserRole } from '../types/dtos';

// Mock JWT verification for demonstration
// In production, use proper JWT library and verification
export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  customerId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Mock JWT decode - in production, use proper JWT verification
    // For demonstration purposes, we'll parse a simple token format
    const decoded = mockDecodeJWT(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      customerId: decoded.customerId,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

function mockDecodeJWT(token: string): AuthenticatedUser {
  // Mock implementation - in production, use jsonwebtoken library
  // Expected format: "userId:role:customerId" (base64 encoded)
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, role, customerId] = decoded.split(':');

    return {
      userId,
      role: role as UserRole,
      customerId: customerId || undefined,
    };
  } catch {
    throw new Error('Invalid token format');
  }
}
