import { config } from './config';
import { logger } from './config/logger';
import { initDatabase, closeDatabase } from './config/database';
import { initRedis, closeRedis } from './config/redis';
import { createApp } from './app';

async function start(): Promise<void> {
  try {
    logger.info('Starting Customer Profile Service...');

    // Initialize database
    const db = initDatabase();
    logger.info('Database initialized');

    // Initialize Redis
    const redis = await initRedis();
    logger.info('Redis initialized');

    // Create Express app
    const app = createApp(db, redis);

    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(
        {
          port: config.server.port,
          env: config.server.env,
          serviceName: config.server.serviceName,
        },
        'Server is running'
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeRedis();
          logger.info('Redis connection closed');

          await closeDatabase();
          logger.info('Database connection closed');

          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
