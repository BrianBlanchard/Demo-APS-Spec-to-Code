import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../config/env.config';
import { UnauthorizedError } from '../errors/custom.errors';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers[envConfig.security.apiKeyHeader.toLowerCase()] as string;

  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }

  if (apiKey !== envConfig.security.internalServiceToken) {
    throw new UnauthorizedError('Invalid API key');
  }

  next();
}
