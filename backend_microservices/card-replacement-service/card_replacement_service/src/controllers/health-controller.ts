import { Request, Response } from 'express';
import { HealthResponse } from '../types/dtos';
import { checkDatabaseConnection } from '../config/database';

export class HealthController {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  health = async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await checkDatabaseConnection();

    const healthResponse: HealthResponse = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: {
        connected: dbConnected,
      },
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(healthResponse);
  };

  liveness = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  };

  readiness = async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await checkDatabaseConnection();

    if (dbConnected) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
