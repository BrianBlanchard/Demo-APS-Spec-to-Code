import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export const createHealthRoutes = (controller: HealthController): Router => {
  const router = Router();

  router.get('/ready', controller.readiness.bind(controller));
  router.get('/live', controller.liveness.bind(controller));

  return router;
};

export const createV1HealthRoutes = (controller: HealthController): Router => {
  const router = Router();

  router.get('/health', controller.health.bind(controller));

  return router;
};
