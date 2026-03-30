import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { GenerateReportRequestSchema } from '../dtos/report.dto';

export function createReportRoutes(reportController: ReportController): Router {
  const router = Router();

  router.post(
    '/reports/accounts',
    validateRequest(GenerateReportRequestSchema),
    reportController.generateReport
  );

  return router;
}
