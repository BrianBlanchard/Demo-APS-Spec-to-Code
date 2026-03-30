import { Request, Response } from 'express';
import { db } from '../config/database.config';
import { RedisConfig } from '../config/redis.config';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
}

export class HealthController {
  async checkHealth(_req: Request, res: Response): Promise<void> {
    const checks = {
      database: 'down' as 'up' | 'down',
      redis: 'down' as 'up' | 'down',
    };

    try {
      await db.raw('SELECT 1');
      checks.database = 'up';
    } catch (error) {
      // Database is down
    }

    try {
      const redis = await RedisConfig.getInstance();
      await redis.ping();
      checks.redis = 'up';
    } catch (error) {
      // Redis is down
    }

    const status = checks.database === 'up' && checks.redis === 'up' ? 'healthy' : 'unhealthy';

    const response: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    const statusCode = status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  }

  async checkReadiness(_req: Request, res: Response): Promise<void> {
    try {
      await db.raw('SELECT 1');
      res.status(200).json({ status: 'ready' });
    } catch (error) {
      res.status(503).json({ status: 'not ready' });
    }
  }

  async checkLiveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ status: 'alive' });
  }
}
