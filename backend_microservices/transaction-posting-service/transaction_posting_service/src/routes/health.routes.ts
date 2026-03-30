import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/ready', (req, res) => controller.readiness(req, res));
  router.get('/live', (req, res) => controller.liveness(req, res));

  return router;
}

export function createV1HealthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get('/transaction-posting/health', (req, res) => controller.health(req, res));

  return router;
}
