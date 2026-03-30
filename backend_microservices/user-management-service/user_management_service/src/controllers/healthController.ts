import { Request, Response } from 'express';
import { HealthCheckResponse } from '../models/dtos';
import { checkDatabaseHealth } from '../config/database';
import { config } from '../config/config';

export class HealthController {
  async checkHealth(_req: Request, res: Response): Promise<void> {
    const dbStatus = await checkDatabaseHealth();

    const healthResponse: HealthCheckResponse = {
      status: dbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: config.serviceName,
      version: '1.0.0',
      checks: {
        database: dbStatus ? 'up' : 'down',
      },
    };

    const statusCode = dbStatus ? 200 : 503;
    res.status(statusCode).json(healthResponse);
  }

  async checkReadiness(_req: Request, res: Response): Promise<void> {
    const dbStatus = await checkDatabaseHealth();

    if (dbStatus) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  }

  async checkLiveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ status: 'alive' });
  }
}
