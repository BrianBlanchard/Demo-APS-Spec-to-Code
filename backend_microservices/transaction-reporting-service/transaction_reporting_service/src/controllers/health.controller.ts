import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../database/connection';
import { HealthResponseDto } from '../dto/health-response.dto';

export class HealthController {
  async readiness(_req: Request, res: Response): Promise<void> {
    const dbConnected = await checkDatabaseConnection();

    const response: HealthResponseDto = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbConnected,
      },
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(response);
  }

  async liveness(_req: Request, res: Response): Promise<void> {
    const response: HealthResponseDto = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true, // Don't check DB for liveness
      },
    };

    res.status(200).json(response);
  }
}
