import express, { Application } from 'express';
import pinoHttp from 'pino-http';
import { Pool } from 'pg';
import config from './config/config';
import logger from './logger/logger';
import { requestContextMiddleware } from './middleware/request-context-middleware';
import { errorHandler } from './middleware/error-handler';
import { createAccountRoutes } from './routes/account-routes';
import { createHealthRoutes } from './routes/health-routes';
import { AccountController } from './controllers/account-controller';
import { HealthController } from './controllers/health-controller';
import { AccountServiceImpl } from './services/account-service';
import { AuditServiceImpl } from './services/audit-service';
import { AccountRepositoryImpl } from './repositories/account-repository';
import { CustomerRepositoryImpl } from './repositories/customer-repository';
import { DisclosureGroupRepositoryImpl } from './repositories/disclosure-group-repository';
import { AccountTypeConfigRepositoryImpl } from './repositories/account-type-config-repository';
import { AuditRepositoryImpl } from './repositories/audit-repository';

export function createApp(pool: Pool): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
    })
  );

  // Request context (must be before routes)
  app.use(requestContextMiddleware);

  // CORS
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (config.cors.credentials) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
  });

  // Initialize repositories
  const accountRepository = new AccountRepositoryImpl(pool);
  const customerRepository = new CustomerRepositoryImpl(pool);
  const disclosureGroupRepository = new DisclosureGroupRepositoryImpl(pool);
  const accountTypeConfigRepository = new AccountTypeConfigRepositoryImpl(pool);
  const auditRepository = new AuditRepositoryImpl(pool);

  // Initialize services
  const auditService = new AuditServiceImpl(auditRepository);
  const accountService = new AccountServiceImpl(
    pool,
    accountRepository,
    customerRepository,
    disclosureGroupRepository,
    accountTypeConfigRepository,
    auditService
  );

  // Initialize controllers
  const accountController = new AccountController(accountService);
  const healthController = new HealthController();

  // Routes
  const apiBasePath = `${config.server.apiBasePath}/${config.server.apiVersion}/${config.server.capabilityName}`;
  app.use(apiBasePath, createAccountRoutes(accountController));
  app.use('/health', createHealthRoutes(healthController));

  // Additional health endpoint for backward compatibility
  app.use(`${apiBasePath}/health`, createHealthRoutes(healthController));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
