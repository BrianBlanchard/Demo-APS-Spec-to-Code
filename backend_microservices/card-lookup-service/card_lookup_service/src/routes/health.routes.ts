import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get('/health', (req, res) => healthController.healthCheck(req, res));
  router.get('/health/ready', (req, res) => healthController.readinessCheck(req, res));
  router.get('/health/live', (req, res) => healthController.livenessCheck(req, res));

  return router;
}
