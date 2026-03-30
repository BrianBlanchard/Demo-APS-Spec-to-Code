import express, { Router } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import knex from 'knex';
import { databaseConfig } from './config/database.config';
import { serverConfig } from './config/server.config';
import { requestContextMiddleware } from './middleware/request-context.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { validateRequest } from './middleware/validation.middleware';
import { TransactionCategoryRepository } from './repositories/transaction-category.repository';
import { AuditService } from './services/audit.service';
import { TransactionCategorizationService } from './services/transaction-categorization.service';
import { HealthController } from './controllers/health.controller';
import { TransactionCategorizationController } from './controllers/transaction-categorization.controller';
import { CategorizeRequestSchema } from './dto/categorize-request.dto';
import logger from './utils/logger';

export const createApp = (): express.Application => {
  const app = express();

  // Initialize database
  const db = knex(databaseConfig);

  // Initialize repositories
  const categoryRepository = new TransactionCategoryRepository(db);

  // Initialize services
  const auditService = new AuditService();
  const categorizationService = new TransactionCategorizationService(
    categoryRepository,
    auditService
  );

  // Initialize controllers
  const healthController = new HealthController(categoryRepository);
  const categorizationController = new TransactionCategorizationController(categorizationService);

  // Middleware
  app.use(express.json());
  app.use(
    cors({
      origin:
        serverConfig.env === 'production'
          ? serverConfig.cors.apiDocsOrigin.split(',')
          : serverConfig.cors.origin,
    })
  );
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health/live',
      },
    })
  );
  app.use(requestContextMiddleware);

  // Health routes
  const healthRouter = Router();
  healthRouter.get('/live', healthController.checkLiveness.bind(healthController));
  healthRouter.get('/ready', healthController.checkReadiness.bind(healthController));
  app.use('/health', healthRouter);

  // API routes
  const apiRouter = Router();
  apiRouter.post(
    '/v1/transactions/categorize',
    validateRequest(CategorizeRequestSchema),
    categorizationController.categorizeTransaction.bind(categorizationController)
  );
  apiRouter.get(
    '/v1/transaction-categorization/health',
    healthController.checkHealth.bind(healthController)
  );
  app.use('/api', apiRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  // Store db instance on app for graceful shutdown
  app.locals.db = db;

  return app;
};
