import express, { Express } from 'express';
import { getDatabase } from './config/database';
import { VerificationRepositoryImpl } from './repositories/VerificationRepository';
import { ExternalServiceClientImpl } from './services/external/ExternalServiceClient';
import { AuditServiceImpl } from './audit/AuditService';
import { VerificationServiceImpl } from './services/VerificationService';
import { VerificationController } from './controllers/VerificationController';
import { HealthController } from './controllers/HealthController';
import { createVerificationRoutes } from './routes/verificationRoutes';
import { createHealthRoutes, createV1HealthRoutes } from './routes/healthRoutes';
import { requestContextMiddleware } from './middleware/requestContext';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './logging/logger';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestContextMiddleware);

  const db = getDatabase();
  const verificationRepository = new VerificationRepositoryImpl(db);
  const externalServiceClient = new ExternalServiceClientImpl();
  const auditService = new AuditServiceImpl();
  const verificationService = new VerificationServiceImpl(
    verificationRepository,
    externalServiceClient,
    auditService
  );

  const verificationController = new VerificationController(verificationService);
  const healthController = new HealthController();

  app.use('/health', createHealthRoutes(healthController));
  app.use('/api/v1/verification', createVerificationRoutes(verificationController));
  app.use('/api/v1/customer-verification', createV1HealthRoutes(healthController));

  app.use(errorHandler);

  logger.info('Application initialized successfully');

  return app;
};
