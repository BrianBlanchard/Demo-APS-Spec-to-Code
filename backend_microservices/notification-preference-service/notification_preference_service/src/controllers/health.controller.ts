import { Request, Response } from 'express';
import { Knex } from 'knex';
import { HealthCheckResponseDto } from '../types/health-check.dto';

export class HealthController {
  constructor(private readonly db: Knex) {}

  ready = async (_req: Request, res: Response): Promise<void> => {
    const timestamp = new Date().toISOString();
    let dbStatus: 'UP' | 'DOWN' = 'DOWN';

    try {
      await this.db.raw('SELECT 1');
      dbStatus = 'UP';
    } catch (error) {
      // Database is down
    }

    const response: HealthCheckResponseDto = {
      status: dbStatus === 'UP' ? 'UP' : 'DOWN',
      timestamp,
      checks: {
        database: dbStatus,
      },
    };

    const statusCode = response.status === 'UP' ? 200 : 503;
    res.status(statusCode).json(response);
  };

  live = async (_req: Request, res: Response): Promise<void> => {
    const response: HealthCheckResponseDto = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'UP',
      },
    };

    res.status(200).json(response);
  };
}
