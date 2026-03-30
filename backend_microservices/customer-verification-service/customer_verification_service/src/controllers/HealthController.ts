import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { logger } from '../logging/logger';

export class HealthController {
  async readiness(_req: Request, res: Response): Promise<void> {
    try {
      const db = getDatabase();
      await db.raw('SELECT 1');

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Readiness check failed');
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unhealthy',
        },
      });
    }
  }

  liveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  health(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'customer-verification-service',
      version: '1.0.0',
    });
  }
}
