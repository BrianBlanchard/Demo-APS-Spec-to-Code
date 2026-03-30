import express, { Application } from 'express';
import cors from 'cors';
import { getAppConfig } from './config/app.config';
import { getDatabase } from './config/database.config';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerService } from './services/customer.service';
import { AuditService } from './services/audit.service';
import { CustomerController } from './controllers/customer.controller';
import { HealthController } from './controllers/health.controller';
import { createCustomerRoutes } from './routes/customer.routes';
import { createHealthRoutes } from './routes/health.routes';
import { tracingMiddleware } from './middleware/tracing.middleware';
import { errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();
  const config = getAppConfig();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(tracingMiddleware);

  // Initialize dependencies
  const db = getDatabase();
  const customerRepository = new CustomerRepository(db);
  const auditService = new AuditService();
  const customerService = new CustomerService(customerRepository, auditService);

  // Initialize controllers
  const customerController = new CustomerController(customerService);
  const healthController = new HealthController();

  // Routes
  app.use('/api/v1', createCustomerRoutes(customerController));
  app.use('/health', createHealthRoutes(healthController));
  app.use('/v1/customer-registration/health', createHealthRoutes(healthController));

  // Error handling
  app.use(errorHandler);

  return app;
};
