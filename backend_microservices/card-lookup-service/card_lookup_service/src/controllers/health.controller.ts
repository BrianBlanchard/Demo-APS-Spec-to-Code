import { Request, Response } from 'express';
import { getDatabase } from '../infrastructure/database';
import { getCache } from '../infrastructure/cache';

export class HealthController {
  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'card-lookup-service',
    });
  }

  async readinessCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      const db = getDatabase();
      await db.raw('SELECT 1');

      // Check cache connection
      const cache = getCache();
      await cache.ping();

      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'UP',
          cache: 'UP',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async livenessCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ALIVE',
      timestamp: new Date().toISOString(),
    });
  }
}
