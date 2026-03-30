import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

export const createHealthRoutes = (): Router => {
  const router = Router();
  const healthController = new HealthController();

  router.get('/health', healthController.checkHealth);
  router.get('/health/ready', healthController.checkReadiness);
  router.get('/health/live', healthController.checkLiveness);

  return router;
};
