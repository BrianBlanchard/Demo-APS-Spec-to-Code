import { Request, Response, Router } from 'express';
import { getDatabase } from '../config/database';
import { getRedisClient } from '../config/redis';

export class HealthController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/health', this.health.bind(this));
    this.router.get('/health/live', this.liveness.bind(this));
    this.router.get('/health/ready', this.readiness.bind(this));
  }

  private async health(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'account-balance-service',
    });
  }

  private liveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }

  private async readiness(_req: Request, res: Response): Promise<void> {
    const checks: Record<string, string> = {};

    try {
      const db = getDatabase();
      await db.raw('SELECT 1');
      checks.database = 'ready';
    } catch (error) {
      checks.database = 'not ready';
    }

    try {
      const redis = await getRedisClient();
      await redis.ping();
      checks.redis = 'ready';
    } catch (error) {
      checks.redis = 'not ready';
    }

    const isReady = Object.values(checks).every((status) => status === 'ready');

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
}
