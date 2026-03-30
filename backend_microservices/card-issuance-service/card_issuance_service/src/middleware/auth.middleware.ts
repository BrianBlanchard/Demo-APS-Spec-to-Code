import { Request, Response, NextFunction } from 'express';
import { AsyncContext } from '../context/async-context';

// Simple JWT verification middleware (stub for demonstration)
// In production, use a proper JWT library like jsonwebtoken
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      errorCode: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header',
      timestamp: new Date().toISOString(),
      traceId: AsyncContext.getTraceId(),
    });
    return;
  }

  const token = authHeader.substring(7);

  // In production, verify JWT token here
  // For now, extract user ID from token (stubbed)
  try {
    // Stub: In production, decode and verify JWT
    const userId = extractUserIdFromToken(token);
    const role = extractRoleFromToken(token);

    // Check for Operator+ role
    if (!isOperatorOrHigher(role)) {
      res.status(403).json({
        errorCode: 'FORBIDDEN',
        message: 'Insufficient permissions. Operator+ role required.',
        timestamp: new Date().toISOString(),
        traceId: AsyncContext.getTraceId(),
      });
      return;
    }

    // Store user ID in context
    AsyncContext.setUserId(userId);

    // Attach to request for downstream use
    (req as any).userId = userId;
    (req as any).userRole = role;

    next();
  } catch (error) {
    res.status(401).json({
      errorCode: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
      traceId: AsyncContext.getTraceId(),
    });
  }
}

// Stub functions for JWT handling
function extractUserIdFromToken(_token: string): string {
  // In production: decode JWT and extract user ID
  // For demo: return a placeholder
  return _token.length > 10 ? 'user-123' : 'user-unknown';
}

function extractRoleFromToken(_token: string): string {
  // In production: decode JWT and extract role
  // For demo: return operator role
  return 'operator';
}

function isOperatorOrHigher(role: string): boolean {
  const allowedRoles = ['operator', 'admin', 'super-admin'];
  return allowedRoles.includes(role.toLowerCase());
}
