import { Request, Response } from 'express';
import { Knex } from 'knex';
import { createLogger } from '../utils/logger';

const logger = createLogger('HealthController');

export class HealthController {
  constructor(private readonly db: Knex) {}

  liveness = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
    });
  };

  readiness = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.db.raw('SELECT 1');

      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'UP',
        },
      });
    } catch (error) {
      logger.error({ error }, 'Readiness check failed');

      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'DOWN',
        },
      });
    }
  };

  health = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.db.raw('SELECT 1');

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'account-reporting-service',
        version: '1.0.0',
      });
    } catch (error) {
      logger.error({ error }, 'Health check failed');

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'account-reporting-service',
        version: '1.0.0',
      });
    }
  };
}
