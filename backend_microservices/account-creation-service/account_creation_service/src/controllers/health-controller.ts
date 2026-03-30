import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../database/connection';
import { HealthCheckResponse } from '../types/dtos';

export class HealthController {
  async liveness(_req: Request, res: Response): Promise<void> {
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    res.status(200).json(response);
  }

  async readiness(_req: Request, res: Response): Promise<void> {
    const dbConnected = await checkDatabaseConnection();

    const response: HealthCheckResponse = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(response);
  }
}
