import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types/health.types';
import { getDatabase } from '../config/database.config';

export class HealthController {
  async readiness(_req: Request, res: Response): Promise<void> {
    try {
      const db = getDatabase();
      await db.raw('SELECT 1');

      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'ok',
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const response: HealthCheckResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'error',
        },
      };

      res.status(503).json(response);
    }
  }

  async liveness(_req: Request, res: Response): Promise<void> {
    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    res.status(200).json(response);
  }
}
