import express, { Application } from 'express';
import cors from 'cors';
import { Knex } from 'knex';
import { config } from './config/env';
import { requestContextMiddleware } from './middleware/request-context';
import { loggingMiddleware } from './middleware/logging';
import { errorHandler } from './middleware/error-handler';
import { createTransactionRoutes } from './routes/transaction.routes';
import { createHealthRoutes, createV1HealthRoutes } from './routes/health.routes';
import { TransactionController } from './controllers/transaction.controller';
import { HealthController } from './controllers/health.controller';
import { TransactionServiceImpl } from './services/transaction.service';
import { AuditServiceImpl } from './services/audit.service';
import { EventPublisherImpl } from './services/event-publisher.service';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';
import { AccountRepositoryImpl } from './repositories/account.repository';
import { ValidationRepositoryImpl } from './repositories/validation.repository';
import { CardRepositoryImpl } from './repositories/card.repository';

export function createApp(db: Knex): Application {
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: config.cors.allowAll ? '*' : config.cors.allowedOrigins,
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request context (must be before logging)
  app.use(requestContextMiddleware);

  // Logging
  app.use(loggingMiddleware);

  // Initialize repositories
  const transactionRepository = new TransactionRepositoryImpl(db);
  const accountRepository = new AccountRepositoryImpl(db);
  const validationRepository = new ValidationRepositoryImpl(db);
  const cardRepository = new CardRepositoryImpl(db);

  // Initialize services
  const auditService = new AuditServiceImpl();
  const eventPublisher = new EventPublisherImpl();

  const transactionService = new TransactionServiceImpl(
    db,
    transactionRepository,
    accountRepository,
    validationRepository,
    cardRepository,
    auditService,
    eventPublisher,
  );

  // Initialize controllers
  const transactionController = new TransactionController(transactionService);
  const healthController = new HealthController(db);

  // Routes
  app.use('/health', createHealthRoutes(healthController));
  app.use('/v1', createV1HealthRoutes(healthController));
  app.use('/api/v1', createTransactionRoutes(transactionController));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
