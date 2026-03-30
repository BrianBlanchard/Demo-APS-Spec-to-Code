import express, { Express } from 'express';
import { getDatabase } from './database/connection';
import { ReportRepository } from './repositories/report.repository';
import { AuditService } from './services/audit.service';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { HealthController } from './controllers/health.controller';
import { createRoutes } from './routes';
import { contextMiddleware } from './middleware/context.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(contextMiddleware);
  app.use(corsMiddleware);

  // Dependency injection
  const db = getDatabase();
  const reportRepository = new ReportRepository(db);
  const auditService = new AuditService();
  const reportService = new ReportService(reportRepository, auditService);
  const reportController = new ReportController(reportService);
  const healthController = new HealthController();

  // Routes
  const routes = createRoutes(reportController, healthController);
  app.use(routes);

  // Error handling (must be last)
  app.use(errorMiddleware);

  logger.info('Application initialized');

  return app;
}
