import { Request, Response } from 'express';
import { Knex } from 'knex';

export class HealthController {
  constructor(private readonly db: Knex) {}

  async healthLive(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
    });
  }

  async healthReady(_req: Request, res: Response): Promise<void> {
    try {
      await this.db.raw('SELECT 1');
      res.status(200).json({
        status: 'UP',
        database: 'UP',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'DOWN',
        database: 'DOWN',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async healthV1(_req: Request, res: Response): Promise<void> {
    try {
      await this.db.raw('SELECT 1');
      res.status(200).json({
        status: 'UP',
        service: 'payment-confirmation',
        version: '1.0.0',
        database: 'UP',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'DOWN',
        service: 'payment-confirmation',
        version: '1.0.0',
        database: 'DOWN',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
