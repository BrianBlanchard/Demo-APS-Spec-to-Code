import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/ready', controller.readiness.bind(controller));
  router.get('/live', controller.liveness.bind(controller));

  return router;
}
