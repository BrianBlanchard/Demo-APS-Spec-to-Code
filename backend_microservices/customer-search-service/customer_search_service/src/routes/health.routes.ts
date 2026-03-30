import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get('/', controller.healthCheck.bind(controller));
  router.get('/ready', controller.readiness.bind(controller));
  router.get('/live', controller.liveness.bind(controller));

  return router;
}
