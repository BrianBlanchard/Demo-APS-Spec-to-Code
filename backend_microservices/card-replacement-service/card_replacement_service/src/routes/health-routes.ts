import { Router } from 'express';
import { HealthController } from '../controllers/health-controller';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/health', controller.health);
  router.get('/health/live', controller.liveness);
  router.get('/health/ready', controller.readiness);

  return router;
}
