import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import { appConfig } from './config/app.config';
import { logger } from './config/logger.config';
import { requestContextMiddleware } from './middleware/request-context.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { getDatabase } from './database/database';
import { EmailTemplateRepository } from './repositories/email-template.repository';
import { EmailNotificationRepository } from './repositories/email-notification.repository';
import { SendGridService } from './services/sendgrid.service';
import { AuditService } from './services/audit.service';
import { EmailNotificationService } from './services/email-notification.service';
import { EmailNotificationController } from './controllers/email-notification.controller';
import { HealthController } from './controllers/health.controller';
import { createEmailNotificationRoutes } from './routes/email-notification.routes';
import { createHealthRoutes } from './routes/health.routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/health/live' || req.url === '/health/ready',
      },
    })
  );
  app.use(requestContextMiddleware);

  // CORS configuration
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', appConfig.cors.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Trace-Id');
    res.header('Access-Control-Allow-Credentials', String(appConfig.cors.credentials));

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  // Dependency Injection
  const db = getDatabase();
  const templateRepository = new EmailTemplateRepository(db);
  const notificationRepository = new EmailNotificationRepository(db);
  const sendGridService = new SendGridService();
  const auditService = new AuditService();
  const emailNotificationService = new EmailNotificationService(
    templateRepository,
    notificationRepository,
    sendGridService,
    auditService
  );
  const emailNotificationController = new EmailNotificationController(emailNotificationService);
  const healthController = new HealthController();

  // Routes
  app.use('/health', createHealthRoutes(healthController));
  app.use('/api/v1/notifications', createEmailNotificationRoutes(emailNotificationController));

  // Root health endpoint
  app.get('/', (_req, res) => {
    res.status(200).json({
      service: 'Email Notification Service',
      version: '1.0.0',
      status: 'UP',
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
