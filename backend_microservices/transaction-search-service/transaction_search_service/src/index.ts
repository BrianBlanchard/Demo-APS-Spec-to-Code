import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import { Knex } from 'knex';
import { getAppConfig, getDatabaseConfig, createDatabaseConnection } from './config';
import { contextMiddleware, errorMiddleware } from './middleware';
import { logger } from './utils/logger';
import { TransactionRepository } from './repositories';
import { AuditService, AuthorizationService, TransactionSearchService } from './services';
import { TransactionSearchController, HealthController } from './controllers';
import { createTransactionSearchRoutes, createHealthRoutes } from './routes';

class TransactionSearchApplication {
  private app: Application;
  private db: Knex;
  private config = getAppConfig();

  constructor() {
    this.app = express();
    this.db = createDatabaseConnection(getDatabaseConfig());
  }

  private setupMiddleware(): void {
    // CORS
    const corsOptions =
      this.config.corsAllowedOrigins === '*'
        ? {}
        : { origin: this.config.corsAllowedOrigins.split(',') };
    this.app.use(cors(corsOptions));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Context middleware for trace ID
    this.app.use(contextMiddleware);
  }

  private setupRoutes(): void {
    // Initialize dependencies
    const transactionRepository = new TransactionRepository(this.db);
    const auditService = new AuditService();
    const authorizationService = new AuthorizationService();
    const transactionSearchService = new TransactionSearchService(
      transactionRepository,
      auditService,
      authorizationService
    );

    // Initialize controllers
    const transactionSearchController = new TransactionSearchController(
      transactionSearchService
    );
    const healthController = new HealthController(this.db);

    // Setup routes
    this.app.use('/health', createHealthRoutes(healthController));
    this.app.use('/api/v1/transactions', createTransactionSearchRoutes(transactionSearchController));
    this.app.use('/v1/transaction-search/health', createHealthRoutes(healthController));
  }

  private setupErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  async start(): Promise<void> {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();

    const server = this.app.listen(this.config.port, () => {
      logger.info(
        {
          port: this.config.port,
          env: this.config.nodeEnv,
        },
        'Transaction Search Service started'
      );
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await this.db.destroy();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

// Start application
const application = new TransactionSearchApplication();
application.start().catch((error) => {
  logger.error({ error }, 'Failed to start application');
  process.exit(1);
});
