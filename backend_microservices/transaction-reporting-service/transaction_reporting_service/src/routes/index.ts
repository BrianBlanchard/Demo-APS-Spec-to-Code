import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { HealthController } from '../controllers/health.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { ReportRequestSchema } from '../dto/report-request.dto';

export function createRoutes(
  reportController: ReportController,
  healthController: HealthController
): Router {
  const router = Router();

  // Health endpoints
  router.get('/health/ready', (req, res) => healthController.readiness(req, res));
  router.get('/health/live', (req, res) => healthController.liveness(req, res));

  // API v1 routes
  const apiV1 = Router();

  // Transaction reporting endpoints
  apiV1.post(
    '/reports/transactions',
    validateRequest(ReportRequestSchema),
    (req, res, next) => reportController.generateReport(req, res, next)
  );

  // Health check with versioning
  apiV1.get('/transaction-reporting/health', (req, res) =>
    healthController.readiness(req, res)
  );

  router.use('/api/v1', apiV1);

  return router;
}
