import { Request, Response } from 'express';
import { database } from '../repositories/database';
import { elasticsearchClient } from '../repositories/elasticsearch.client';
import { redisClient } from '../repositories/redis.client';

export class HealthController {
  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }

  async readiness(_req: Request, res: Response): Promise<void> {
    const checks = {
      database: await database.healthCheck(),
      elasticsearch: await elasticsearchClient.healthCheck(),
      redis: await redisClient.healthCheck(),
    };

    const allHealthy = Object.values(checks).every((status) => status);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  }

  async liveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }
}
