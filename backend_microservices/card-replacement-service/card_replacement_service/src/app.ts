import express, { Application } from 'express';
import cors from 'cors';
import { getDatabase } from './config/database';
import { CardRepository } from './repositories/card-repository';
import { CardReplacementRepository } from './repositories/card-replacement-repository';
import { AuditRepository } from './repositories/audit-repository';
import { AuditService } from './services/audit-service';
import { CardReplacementService } from './services/card-replacement-service';
import { CardReplacementController } from './controllers/card-replacement-controller';
import { HealthController } from './controllers/health-controller';
import { createCardReplacementRoutes } from './routes/card-replacement-routes';
import { createHealthRoutes } from './routes/health-routes';
import { traceMiddleware } from './middleware/trace-middleware';
import { loggingMiddleware } from './middleware/logging-middleware';
import { errorHandler } from './middleware/error-handler';

export function createApp(): Application {
  const app = express();

  // CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Trace context middleware (must be first)
  app.use(traceMiddleware);

  // Logging middleware
  app.use(loggingMiddleware);

  // Dependency injection setup
  const db = getDatabase();

  const cardRepository = new CardRepository(db);
  const replacementRepository = new CardReplacementRepository(db);
  const auditRepository = new AuditRepository(db);

  const auditService = new AuditService(auditRepository);
  const cardReplacementService = new CardReplacementService(
    cardRepository,
    replacementRepository,
    auditService,
  );

  const cardReplacementController = new CardReplacementController(cardReplacementService);
  const healthController = new HealthController();

  // Routes
  app.use('/api/v1', createCardReplacementRoutes(cardReplacementController));
  app.use('/', createHealthRoutes(healthController));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
