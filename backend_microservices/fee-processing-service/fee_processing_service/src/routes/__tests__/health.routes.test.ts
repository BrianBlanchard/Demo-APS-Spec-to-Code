import { Router } from 'express';
import { createHealthRoutes } from '../health.routes';
import { HealthController } from '../../controllers/health.controller';

describe('Health Routes', () => {
  it('should create router with health routes', () => {
    const mockController = new HealthController();

    const router = createHealthRoutes(mockController);

    expect(router).toBeDefined();
    expect(router instanceof Router).toBe(true);
  });
});
