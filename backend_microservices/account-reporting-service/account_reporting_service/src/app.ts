import express, { Express } from 'express';
import { Knex } from 'knex';
import { contextMiddleware } from './middleware/context.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { createReportRoutes } from './routes/report.routes';
import { createHealthRoutes } from './routes/health.routes';
import { ReportController } from './controllers/report.controller';
import { HealthController } from './controllers/health.controller';
import { ReportService } from './services/report.service';
import { AuditService } from './services/audit.service';
import { AccountRepository } from './repositories/account.repository';
import { ReportRepository } from './repositories/report.repository';
import { getAppConfig } from './config/app.config';

export function createApp(db: Knex): Express {
  const app = express();
  const config = getAppConfig();

  // Middleware
  app.use(express.json());
  app.use(contextMiddleware);

  // CORS
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Trace-Id');
    next();
  });

  // Dependencies
  const accountRepository = new AccountRepository(db);
  const reportRepository = new ReportRepository(db);
  const auditService = new AuditService();
  const reportService = new ReportService(accountRepository, reportRepository, auditService);
  const reportController = new ReportController(reportService);
  const healthController = new HealthController(db);

  // Routes
  app.use('/health', createHealthRoutes(healthController));
  app.use('/api/v1', createReportRoutes(reportController));
  app.use('/v1/account-reporting-service/health', createHealthRoutes(healthController));

  // Error handling
  app.use(errorMiddleware);

  return app;
}
