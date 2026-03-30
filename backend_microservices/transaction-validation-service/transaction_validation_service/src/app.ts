import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { envConfig } from './config/env.config';
import { db } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import { contextMiddleware } from './middleware/context.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Repositories
import { CardRepository } from './repositories/card.repository';
import { AccountRepository } from './repositories/account.repository';
import { ValidationRepository } from './repositories/validation.repository';

// Services
import { CacheService } from './services/cache.service';
import { AuditService } from './services/audit.service';
import { TransactionValidationService } from './services/transaction-validation.service';

// Controllers
import { TransactionValidationController } from './controllers/transaction-validation.controller';
import { HealthController } from './controllers/health.controller';

// Routes
import { createTransactionValidationRoutes } from './routes/transaction-validation.routes';
import { createHealthRoutes, createServiceHealthRoutes } from './routes/health.routes';

export async function createApp(): Promise<Application> {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.cors.origin,
      credentials: envConfig.cors.credentials,
    })
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Context middleware (must be before routes)
  app.use(contextMiddleware);

  // Initialize Redis
  const redis = await RedisConfig.getInstance();

  // Initialize repositories
  const cardRepository = new CardRepository(db);
  const accountRepository = new AccountRepository(db);
  const validationRepository = new ValidationRepository(db);

  // Initialize services
  const cacheService = new CacheService(redis);
  const auditService = new AuditService();
  const validationService = new TransactionValidationService(
    cardRepository,
    accountRepository,
    validationRepository,
    cacheService,
    auditService
  );

  // Initialize controllers
  const validationController = new TransactionValidationController(validationService);
  const healthController = new HealthController();

  // Health routes (no auth required)
  app.use('/health', createHealthRoutes(healthController));

  // API routes (with auth)
  app.use(
    `${envConfig.apiBasePath}/transactions`,
    authMiddleware,
    createTransactionValidationRoutes(validationController)
  );

  // Service health (with auth)
  app.use(
    `${envConfig.apiBasePath}/transaction-validation`,
    authMiddleware,
    createServiceHealthRoutes(healthController)
  );

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  return app;
}
