import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { Knex } from 'knex';
import { RedisClientType } from 'redis';

import { config } from './config';
import { logger } from './config/logger';
import { tracingMiddleware } from './middleware/tracingMiddleware';
import { errorHandler } from './middleware/errorHandler';

import { CustomerRepository } from './repositories/CustomerRepository';
import { AuditRepository } from './repositories/AuditRepository';
import { CacheService } from './services/CacheService';
import { AuditService } from './services/AuditService';
import { CustomerService } from './services/CustomerService';
import { CustomerController } from './controllers/CustomerController';
import { HealthController } from './controllers/HealthController';
import { createCustomerRoutes } from './routes/customerRoutes';
import { createHealthRoutes } from './routes/healthRoutes';

export function createApp(db: Knex, redis: RedisClientType): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
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

  // Tracing
  app.use(tracingMiddleware);

  // Initialize repositories
  const customerRepository = new CustomerRepository(db);
  const auditRepository = new AuditRepository(db);

  // Initialize services
  const cacheService = new CacheService(redis);
  const auditService = new AuditService(auditRepository);
  const customerService = new CustomerService(customerRepository, cacheService, auditService);

  // Initialize controllers
  const customerController = new CustomerController(customerService);
  const healthController = new HealthController(db, redis);

  // Routes
  app.use('/health', createHealthRoutes(healthController));
  app.use('/api/v1/customers', createCustomerRoutes(customerController));

  // Root health check (alternative path)
  app.get('/api/customer-profile/health', healthController.health);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      errorCode: 'NOT_FOUND',
      message: 'Route not found',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
