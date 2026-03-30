import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { AsyncContext } from '../context/async-context';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as any).userId || req.ip || 'anonymous';
  const now = Date.now();

  // Clean up expired entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Get or create entry
  let entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.rateLimit.windowMs,
    };
    rateLimitStore.set(userId, entry);
  }

  // Increment count
  entry.count++;

  // Check limit
  if (entry.count > config.rateLimit.maxRequests) {
    res.status(429).json({
      errorCode: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Maximum ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000} seconds.`,
      timestamp: new Date().toISOString(),
      traceId: AsyncContext.getTraceId(),
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', config.rateLimit.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (config.rateLimit.maxRequests - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

  next();
}
