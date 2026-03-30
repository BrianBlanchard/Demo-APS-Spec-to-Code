import { Request, Response } from 'express';
import { getDatabase } from '../database/database';

export class HealthController {
  async liveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
    });
  }

  async readiness(_req: Request, res: Response): Promise<void> {
    try {
      const db = getDatabase();
      await db.raw('SELECT 1');

      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'UP',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'DOWN',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
