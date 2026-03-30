import express, { Express } from 'express';
import cors from 'cors';
import knex, { Knex } from 'knex';
import { appConfig } from './config/app.config';
import databaseConfig from './config/database.config';
import { requestContextMiddleware } from './middleware/request-context.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { AuditService } from './services/audit.service';
import { NotificationPreferenceController } from './controllers/notification-preference.controller';
import { HealthController } from './controllers/health.controller';
import { createNotificationPreferenceRoutes } from './routes/notification-preference.routes';
import { createHealthRoutes } from './routes/health.routes';

export const createApp = (): { app: Express; db: Knex } => {
  const app = express();

  // Database connection
  const db = knex(databaseConfig);

  // CORS configuration
  const corsOptions = {
    origin: appConfig.nodeEnv === 'production' ? appConfig.corsOrigin.split(',') : '*',
    credentials: true,
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  app.use(loggingMiddleware);

  // Dependency injection
  const auditService = new AuditService();
  const notificationPreferenceRepository = new NotificationPreferenceRepository(db);
  const notificationPreferenceService = new NotificationPreferenceService(
    notificationPreferenceRepository,
    auditService
  );
  const notificationPreferenceController = new NotificationPreferenceController(
    notificationPreferenceService
  );
  const healthController = new HealthController(db);

  // Routes
  app.use('/health', createHealthRoutes(healthController));
  app.use('/api/v1', createNotificationPreferenceRoutes(notificationPreferenceController));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return { app, db };
};
