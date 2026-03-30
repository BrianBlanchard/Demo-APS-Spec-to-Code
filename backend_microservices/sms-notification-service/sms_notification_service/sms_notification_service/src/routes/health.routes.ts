import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();

  router.get('/health/live', controller.liveness.bind(controller));
  router.get('/health/ready', controller.readiness.bind(controller));
  router.get('/v1/sms-notification/health', controller.health.bind(controller));

  return router;
}
