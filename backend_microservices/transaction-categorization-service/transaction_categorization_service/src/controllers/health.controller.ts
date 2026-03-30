import { Request, Response } from 'express';
import type { ITransactionCategoryRepository } from '../repositories/transaction-category.repository';
import type { HealthResponse } from '../dto/categorize-response.dto';

export class HealthController {
  constructor(private readonly categoryRepository: ITransactionCategoryRepository) {}

  async checkHealth(_req: Request, res: Response): Promise<void> {
    const isDatabaseHealthy = await this.categoryRepository.checkDatabaseHealth();

    const response: HealthResponse = {
      status: isDatabaseHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDatabaseHealthy ? 'UP' : 'DOWN',
    };

    const statusCode = isDatabaseHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  }

  async checkLiveness(_req: Request, res: Response): Promise<void> {
    const response: HealthResponse = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    res.status(200).json(response);
  }

  async checkReadiness(_req: Request, res: Response): Promise<void> {
    const isDatabaseHealthy = await this.categoryRepository.checkDatabaseHealth();

    const response: HealthResponse = {
      status: isDatabaseHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDatabaseHealthy ? 'UP' : 'DOWN',
    };

    const statusCode = isDatabaseHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  }
}
