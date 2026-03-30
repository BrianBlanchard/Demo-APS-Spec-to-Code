import { createApp } from './app';
import { createDatabaseConnection } from './config/database';
import { config } from './config/env';
import { logger } from './config/logger';
import { EventPublisherImpl } from './services/event-publisher.service';

async function start(): Promise<void> {
  try {
    // Initialize database connection
    const db = createDatabaseConnection();
    logger.info('Database connection established');

    // Initialize Kafka event publisher
    const eventPublisher = new EventPublisherImpl();
    await eventPublisher.connect();

    // Create Express app
    const app = createApp(db);

    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(
        {
          port: config.server.port,
          nodeEnv: config.server.nodeEnv,
        },
        `Transaction Posting Service started on port ${config.server.port}`,
      );
    });

    // Graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully...');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await eventPublisher.disconnect();
          await db.destroy();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
