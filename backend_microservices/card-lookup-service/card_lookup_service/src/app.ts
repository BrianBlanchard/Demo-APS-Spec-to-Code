import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './infrastructure/config';
import { logger } from './infrastructure/logger';
import { traceContextMiddleware } from './middleware/trace-context.middleware';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { createCardRoutes } from './routes/card.routes';
import { createHealthRoutes } from './routes/health.routes';
import { CardController } from './controllers/card.controller';
import { HealthController } from './controllers/health.controller';
import { CardService } from './services/card.service';
import { MaskingService } from './services/masking.service';
import { AuditService } from './services/audit.service';
import { CacheService } from './services/cache.service';
import { CardRepository } from './repositories/card.repository';
import { AccountRepository } from './repositories/account.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { getDatabase } from './infrastructure/database';
import { getCache } from './infrastructure/cache';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(traceContextMiddleware);

  // Initialize dependencies
  const db = getDatabase();
  const cache = getCache();

  // Repositories
  const cardRepository = new CardRepository(db);
  const accountRepository = new AccountRepository(db);
  const customerRepository = new CustomerRepository(db);
  const transactionRepository = new TransactionRepository(db);

  // Services
  const maskingService = new MaskingService();
  const auditService = new AuditService();
  const cacheService = new CacheService(cache);
  const cardService = new CardService(
    cardRepository,
    accountRepository,
    customerRepository,
    transactionRepository,
    maskingService,
    auditService,
    cacheService
  );

  // Controllers
  const cardController = new CardController(cardService);
  const healthController = new HealthController();

  // Routes
  app.use('/', createHealthRoutes(healthController));
  app.use('/api/v1', createCardRoutes(cardController));

  // Error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
