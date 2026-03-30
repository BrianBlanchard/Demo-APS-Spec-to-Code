import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export const createHealthRouter = (controller: HealthController): Router => {
  const router = Router();

  router.get('/ready', controller.ready);
  router.get('/live', controller.live);
  router.get('/', controller.ready); // Default to ready check

  return router;
};
