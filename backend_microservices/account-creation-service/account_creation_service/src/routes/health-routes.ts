import { Router } from 'express';
import { HealthController } from '../controllers/health-controller';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get('/live', healthController.liveness.bind(healthController));
  router.get('/ready', healthController.readiness.bind(healthController));

  return router;
}
