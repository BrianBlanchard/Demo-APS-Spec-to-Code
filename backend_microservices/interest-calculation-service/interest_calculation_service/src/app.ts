import express, { Application } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { Knex } from 'knex';
import { config } from './config/config';
import { logger } from './config/logger';
import { requestContextMiddleware } from './middleware/requestContext';
import { errorHandler } from './middleware/errorHandler';
import { createInterestRoutes } from './routes/interestRoutes';
import { createHealthRoutes } from './routes/healthRoutes';
import { InterestCalculationController } from './controllers/interestCalculationController';
import { HealthController } from './controllers/healthController';
import { InterestCalculationService } from './services/interestCalculationService';
import { AuditService } from './services/auditService';
import { AccountRepository } from './repositories/accountRepository';
import { InterestCalculationRepository } from './repositories/interestCalculationRepository';
import { MockInterestRateClient } from './repositories/interestRateClient';

export const createApp = (db: Knex): Application => {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.cors.allowOrigin }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(requestContextMiddleware);

  // Dependency injection - Repository layer
  const accountRepository = new AccountRepository(db);
  const calculationRepository = new InterestCalculationRepository(db);
  const rateClient = new MockInterestRateClient(); // Use mock for now

  // Service layer
  const auditService = new AuditService();
  const interestCalculationService = new InterestCalculationService(
    accountRepository,
    calculationRepository,
    rateClient,
    auditService,
  );

  // Controller layer
  const interestCalculationController = new InterestCalculationController(
    interestCalculationService,
  );
  const healthController = new HealthController(db);

  // Routes
  app.use('/api/v1', createInterestRoutes(interestCalculationController));
  app.use('/health', createHealthRoutes(healthController));
  app.use('/v1/interest-calculation/health', createHealthRoutes(healthController));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
