import { Request, Response } from 'express';
import { HealthResponse } from '../types/error.types';
import { envConfig } from '../config/env.config';
import { testDbConnection } from '../config/database.config';

export class HealthController {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  ready = async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await testDbConnection();

    if (!dbConnected) {
      const response: HealthResponse = {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        service: envConfig.serviceName,
        version: envConfig.serviceVersion,
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        database: {
          connected: false,
        },
      };
      res.status(503).json(response);
      return;
    }

    const response: HealthResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: envConfig.serviceName,
      version: envConfig.serviceVersion,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      database: {
        connected: true,
      },
    };

    res.status(200).json(response);
  };

  live = (_req: Request, res: Response): void => {
    const response: HealthResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: envConfig.serviceName,
      version: envConfig.serviceVersion,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };

    res.status(200).json(response);
  };
}
