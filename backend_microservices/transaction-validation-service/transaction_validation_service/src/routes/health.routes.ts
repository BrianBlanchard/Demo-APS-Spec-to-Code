import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/ready', controller.checkReadiness.bind(controller));
  router.get('/live', controller.checkLiveness.bind(controller));

  return router;
}

export function createServiceHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/health', controller.checkHealth.bind(controller));

  return router;
}
