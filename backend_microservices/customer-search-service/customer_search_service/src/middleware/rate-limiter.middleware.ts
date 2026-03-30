import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError } from '../types/error.types';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimiterMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    next();
    return;
  }

  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    next();
    return;
  }

  if (entry.count >= config.rateLimit.maxRequests) {
    throw new AppError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', 429);
  }

  entry.count++;
  next();
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
