import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get('/live', healthController.liveness);
  router.get('/ready', healthController.readiness);

  return router;
}
