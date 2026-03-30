import express, { Express } from 'express';
import { config } from './config/config';
import { database } from './database/db';
import { contextMiddleware } from './middleware/context.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { CardController } from './controllers/card.controller';
import { HealthController } from './controllers/health.controller';
import { CardService } from './services/card.service';
import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';
import { CardRepository } from './repositories/card.repository';
import { AccountRepository } from './repositories/account.repository';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupDependencies();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Context middleware (must be first to capture trace ID)
    this.app.use(contextMiddleware);

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  private setupDependencies(): void {
    // Initialize services and repositories
    const encryptionService = new EncryptionService();
    const auditService = new AuditService();
    const cardRepository = new CardRepository(database);
    const accountRepository = new AccountRepository(database);
    const cardService = new CardService(
      cardRepository,
      accountRepository,
      encryptionService,
      auditService,
    );

    // Initialize controllers
    const cardController = new CardController(cardService);
    const healthController = new HealthController(database);

    // Store controllers in app locals for route setup
    this.app.locals.cardController = cardController;
    this.app.locals.healthController = healthController;
  }

  private setupRoutes(): void {
    const cardController = this.app.locals.cardController as CardController;
    const healthController = this.app.locals.healthController as HealthController;

    // Health endpoints (no auth required)
    this.app.get('/health/ready', healthController.healthReady);
    this.app.get('/health/live', healthController.healthLive);

    // V1 API routes (with auth and rate limiting)
    this.app.post(
      '/api/v1/cards',
      authMiddleware,
      rateLimitMiddleware,
      cardController.issueCard,
    );

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        service: 'Card Issuance Service',
        version: '1.0.0',
        status: 'running',
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Test database connection
      const dbHealthy = await database.healthCheck();
      if (!dbHealthy) {
        throw new Error('Database connection failed');
      }

      console.log('✓ Database connection established');

      // Start server
      this.app.listen(config.server.port, config.server.host, () => {
        console.log(
          `✓ Card Issuance Service running on http://${config.server.host}:${config.server.port}`,
        );
        console.log(`✓ Environment: ${config.server.env}`);
        console.log(`✓ Health check: http://${config.server.host}:${config.server.port}/health/ready`);
      });
    } catch (error) {
      console.error('✗ Failed to start application:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await database.close();
    console.log('✓ Application stopped');
  }
}

// Start application
if (require.main === module) {
  const app = new App();
  app.start();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await app.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await app.stop();
    process.exit(0);
  });
}

export default App;
