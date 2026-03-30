import express, { Application } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './config/logger.config';
import { db } from './config/database.config';
import { envConfig } from './config/env.config';
import { contextMiddleware } from './middleware/context.middleware';
import { errorHandler } from './middleware/error.middleware';
import { createBillingCycleRouter } from './routes/billing-cycle.routes';
import { createHealthRouter } from './routes/health.routes';
import { BillingCycleController } from './controllers/billing-cycle.controller';
import { HealthController } from './controllers/health.controller';
import { BillingCycleService } from './services/billing-cycle.service';
import { AuditService } from './services/audit.service';
import { AccountRepository } from './repositories/account.repository';
import { CycleArchiveRepository } from './repositories/cycle-archive.repository';

export const createApp = (): Application => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Handle JSON parsing errors
  app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid JSON format',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next(err);
  });

  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) {
          return 'error';
        }
        if (res.statusCode >= 400) {
          return 'warn';
        }
        return 'info';
      },
    })
  );

  app.use(contextMiddleware);

  if (envConfig.cors.origin === '*') {
    app.use((_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-trace-id');
      next();
    });
  }

  const accountRepository = new AccountRepository(db);
  const cycleArchiveRepository = new CycleArchiveRepository(db);
  const auditService = new AuditService();
  const billingCycleService = new BillingCycleService(
    accountRepository,
    cycleArchiveRepository,
    auditService
  );
  const billingCycleController = new BillingCycleController(billingCycleService);
  const healthController = new HealthController();

  app.use('/health', createHealthRouter(healthController));
  app.use('/api/v1/billing/cycle', createBillingCycleRouter(billingCycleController));
  app.use('/v1/billing/health', createHealthRouter(healthController));

  app.use(errorHandler);

  return app;
};
