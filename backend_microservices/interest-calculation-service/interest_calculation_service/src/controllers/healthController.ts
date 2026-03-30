import { Request, Response } from 'express';
import { HealthCheckResponse } from '../models/dtos';
import { Knex } from 'knex';

export class HealthController {
  constructor(private readonly db: Knex) {}

  ready = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database connectivity
      await this.db.raw('SELECT 1');

      const response: HealthCheckResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'interest-calculation-service',
        version: '1.0.0',
        checks: {
          database: 'up',
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const response: HealthCheckResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'interest-calculation-service',
        version: '1.0.0',
        checks: {
          database: 'down',
        },
      };

      res.status(503).json(response);
    }
  };

  live = (_req: Request, res: Response): void => {
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'interest-calculation-service',
      version: '1.0.0',
    };

    res.status(200).json(response);
  };
}
