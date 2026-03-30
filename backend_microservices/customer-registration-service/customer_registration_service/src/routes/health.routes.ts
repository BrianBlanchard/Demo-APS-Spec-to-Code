import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export const createHealthRoutes = (healthController: HealthController): Router => {
  const router = Router();

  router.get('/ready', healthController.readiness.bind(healthController));
  router.get('/live', healthController.liveness.bind(healthController));

  return router;
};
