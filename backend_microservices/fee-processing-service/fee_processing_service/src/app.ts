import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/app.config';
import { db } from './config/database.config';
import { requestContextMiddleware } from './middleware/request-context.middleware';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import { createFeeRoutes } from './routes/fee.routes';
import { createHealthRoutes } from './routes/health.routes';
import { FeeController } from './controllers/fee.controller';
import { HealthController } from './controllers/health.controller';
import { FeeService } from './services/fee.service';
import { AuditService } from './services/audit.service';
import { AccountRepository } from './repositories/account.repository';
import { TransactionRepository } from './repositories/transaction.repository';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());
  app.use(requestContextMiddleware);

  const accountRepository = new AccountRepository(db);
  const transactionRepository = new TransactionRepository(db);
  const auditService = new AuditService();
  const feeService = new FeeService(accountRepository, transactionRepository, auditService);
  const feeController = new FeeController(feeService);
  const healthController = new HealthController();

  app.use('/api/v1/fees', createFeeRoutes(feeController));
  app.use('/health', createHealthRoutes(healthController));
  app.use('/v1/fees/health', createHealthRoutes(healthController));

  app.use(errorHandlerMiddleware);

  return app;
}
