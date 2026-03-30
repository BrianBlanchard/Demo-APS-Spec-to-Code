import { Request, Response, NextFunction } from 'express';
import { requestContextStorage, createRequestContext } from '../context/request-context';

export function requestContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Extract user ID from JWT (if present)
  const userId = extractUserIdFromRequest(req);

  // Get client IP
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

  // Create request context
  const context = createRequestContext(userId, ipAddress);

  // Run the rest of the request within the context
  requestContextStorage.run(context, () => {
    next();
  });
}

function extractUserIdFromRequest(req: Request): string | undefined {
  // Extract from Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In production, decode JWT and extract user ID
    // For now, return undefined (authentication is mocked)
    return undefined;
  }
  return undefined;
}
