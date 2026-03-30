import { Request, Response } from 'express';
import { Knex } from 'knex';

export class HealthController {
  constructor(private db: Knex) {}

  async readiness(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connectivity
      await this.db.raw('SELECT 1');

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'up',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'down',
        },
        error: (error as Error).message,
      });
    }
  }

  liveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }

  health(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      service: 'transaction-posting-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }
}
