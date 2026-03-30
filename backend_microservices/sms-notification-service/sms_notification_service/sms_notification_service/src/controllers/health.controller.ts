import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

export class HealthController {
  async liveness(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'sms-notification-service',
    });
  }

  async readiness(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      const db = getDatabase();
      await db.raw('SELECT 1');

      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
        service: 'sms-notification-service',
        checks: {
          database: 'UP',
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        service: 'sms-notification-service',
        checks: {
          database: 'DOWN',
        },
      });
    }
  }

  async health(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'sms-notification-service',
      version: '1.0.0',
    });
  }
}
