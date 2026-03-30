import express, { Application } from 'express';
import { AccountStatusController } from './controllers/account-status.controller';
import { HealthController } from './controllers/health.controller';
import { AccountRepository } from './repositories/account.repository';
import { AccountStatusService } from './services/account-status.service';
import { AuditService } from './services/audit.service';
import { NotificationService } from './services/notification.service';
import { EventPublisher } from './services/event-publisher.service';
import { contextMiddleware } from './middleware/context.middleware';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { authMiddleware, requireRole } from './middleware/auth.middleware';
import { validateBody } from './middleware/validation.middleware';
import { rateLimiterMiddleware } from './middleware/rate-limiter.middleware';
import { StatusUpdateRequestSchema } from './dtos/status-update-request.dto';
import { getDatabase } from './config/database.config';
import { logger } from './utils/logger';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(contextMiddleware);

  // Health endpoints (no auth required)
  const healthController = new HealthController();
  app.get('/health/ready', (req, res) => healthController.readiness(req, res));
  app.get('/health/live', (req, res) => healthController.liveness(req, res));

  // Initialize services
  const db = getDatabase();
  const accountRepository = new AccountRepository(db);
  const auditService = new AuditService();
  const notificationService = new NotificationService(auditService);
  const eventPublisher = new EventPublisher();

  const accountStatusService = new AccountStatusService(
    accountRepository,
    auditService,
    notificationService,
    eventPublisher
  );

  const accountStatusController = new AccountStatusController(accountStatusService);

  // API routes with authentication and rate limiting
  app.put(
    '/api/v1/accounts/:accountId/status',
    authMiddleware,
    requireRole('ADMIN'),
    rateLimiterMiddleware,
    validateBody(StatusUpdateRequestSchema),
    accountStatusController.updateStatus
  );

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  logger.info('Application initialized successfully');

  return app;
}
