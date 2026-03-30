import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get('/ready', healthController.ready.bind(healthController));
  router.get('/live', healthController.live.bind(healthController));

  return router;
}
