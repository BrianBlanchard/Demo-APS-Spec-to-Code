import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { getDatabase } from './config/database';
import { tracingMiddleware } from './middleware/tracing.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { createSmsNotificationRouter } from './routes/sms-notification.routes';
import { createHealthRouter } from './routes/health.routes';
import { SmsNotificationController } from './controllers/sms-notification.controller';
import { HealthController } from './controllers/health.controller';
import { SmsNotificationService } from './services/sms-notification.service';
import { SmsNotificationRepository } from './repositories/sms-notification.repository';
import { CustomerPreferenceRepository } from './repositories/customer-preference.repository';
import { TwilioService } from './services/twilio.service';
import { AuditService } from './services/audit.service';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  const corsOptions =
    config.app.nodeEnv === 'production' && config.app.corsOrigins[0] !== '*'
      ? { origin: config.app.corsOrigins }
      : {};
  app.use(cors(corsOptions));

  // Tracing
  app.use(tracingMiddleware);

  // Initialize dependencies
  const db = getDatabase();

  // Repositories
  const smsRepository = new SmsNotificationRepository(db);
  const customerPrefRepository = new CustomerPreferenceRepository(db);

  // Services
  const twilioService = new TwilioService();
  const auditService = new AuditService();
  const smsNotificationService = new SmsNotificationService(
    smsRepository,
    customerPrefRepository,
    twilioService,
    auditService
  );

  // Controllers
  const smsNotificationController = new SmsNotificationController(smsNotificationService);
  const healthController = new HealthController();

  // Routes
  app.use(createSmsNotificationRouter(smsNotificationController));
  app.use(createHealthRouter(healthController));

  // Error handling (must be last)
  app.use(errorMiddleware);

  return app;
}
