import { createApp } from './app';
import { config } from './config';
import { getDatabase, closeDatabaseConnection } from './config/database';
import { getRedisClient, closeRedisConnection } from './config/redis';
import { getKafkaProducer, closeKafkaProducer } from './config/kafka';
import { AccountBalanceRepository } from './repositories/account-balance.repository';
import { CacheRepository } from './repositories/cache.repository';
import { AuditService } from './services/audit.service';
import { EventService } from './services/event.service';
import { AccountBalanceService } from './services/account-balance.service';
import { AccountBalanceController } from './controllers/account-balance.controller';
import { HealthController } from './controllers/health.controller';
import { logger } from './utils/logger';
import { Server } from 'http';

let server: Server | null = null;

async function bootstrap(): Promise<void> {
  try {
    const db = getDatabase();
    const redis = await getRedisClient();
    const kafkaProducer = await getKafkaProducer();

    const accountBalanceRepository = new AccountBalanceRepository(db);
    const cacheRepository = new CacheRepository(redis);
    const auditService = new AuditService();
    const eventService = new EventService(kafkaProducer);

    const accountBalanceService = new AccountBalanceService(
      accountBalanceRepository,
      cacheRepository,
      auditService,
      eventService
    );

    const accountBalanceController = new AccountBalanceController(accountBalanceService);
    const healthController = new HealthController();

    const app = createApp(accountBalanceController, healthController);

    server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
        },
        'Account Balance Service started'
      );
    });

    setupGracefulShutdown();
  } catch (error) {
    logger.error({ error }, 'Failed to start application');
    process.exit(1);
  }
}

function setupGracefulShutdown(): void {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Received shutdown signal');

    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeKafkaProducer();
          await closeRedisConnection();
          await closeDatabaseConnection();
          logger.info('All connections closed');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
