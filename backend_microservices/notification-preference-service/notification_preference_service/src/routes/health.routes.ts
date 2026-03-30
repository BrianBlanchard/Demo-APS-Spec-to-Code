import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export const createHealthRoutes = (controller: HealthController): Router => {
  const router = Router();

  router.get('/ready', controller.ready);
  router.get('/live', controller.live);

  return router;
};
