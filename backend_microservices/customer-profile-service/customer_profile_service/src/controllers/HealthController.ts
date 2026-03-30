import { Request, Response } from 'express';
import { Knex } from 'knex';
import { RedisClientType } from 'redis';
import { HealthCheckResponseDTO } from '../types/dtos';
import { config } from '../config';

export class HealthController {
  constructor(
    private readonly db: Knex,
    private readonly redis: RedisClientType
  ) {}

  liveness = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  };

  readiness = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database
      await this.db.raw('SELECT 1');
      const dbStatus = 'UP';

      // Check Redis
      await this.redis.ping();
      const redisStatus = 'UP';

      const response: HealthCheckResponseDTO = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: config.server.serviceName,
        version: '1.0.0',
        dependencies: {
          database: dbStatus,
          redis: redisStatus,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        service: config.server.serviceName,
        version: '1.0.0',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  health = async (_req: Request, res: Response): Promise<void> => {
    await this.readiness(_req, res);
  };
}
