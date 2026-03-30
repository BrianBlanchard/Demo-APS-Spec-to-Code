import { Request, Response } from 'express';
import { Database } from '../database/db';

export class HealthController {
  constructor(private db: Database) {}

  healthReady = async (_req: Request, res: Response): Promise<void> => {
    try {
      const dbHealthy = await this.db.healthCheck();

      if (dbHealthy) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'healthy',
          },
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'unhealthy',
          },
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  };

  healthLive = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  };
}
