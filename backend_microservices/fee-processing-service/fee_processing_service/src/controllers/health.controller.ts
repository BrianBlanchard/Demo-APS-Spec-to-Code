import { Request, Response } from 'express';
import { HealthResponseDto } from '../dtos/health-response.dto';
import { config } from '../config/app.config';
import { db } from '../config/database.config';

export class HealthController {
  async ready(_req: Request, res: Response): Promise<void> {
    try {
      await db.raw('SELECT 1');

      const response: HealthResponseDto = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: config.serviceName,
        version: '1.0.0',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: HealthResponseDto = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: config.serviceName,
        version: '1.0.0',
      };

      res.status(503).json(response);
    }
  }

  async live(_req: Request, res: Response): Promise<void> {
    const response: HealthResponseDto = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: config.serviceName,
      version: '1.0.0',
    };

    res.status(200).json(response);
  }
}
