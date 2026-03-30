import { createApp } from './app';
import { envConfig } from './config/env.config';
import { logger } from './config/logger.config';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

async function startServer(): Promise<void> {
  try {
    const app = await createApp();

    const server = app.listen(envConfig.port, () => {
      logger.info(
        {
          port: envConfig.port,
          nodeEnv: envConfig.nodeEnv,
          apiBasePath: envConfig.apiBasePath,
        },
        'Transaction Validation Service started'
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutdown signal received');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await DatabaseConfig.closeConnection();
          logger.info('Database connection closed');

          await RedisConfig.closeConnection();
          logger.info('Redis connection closed');

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

startServer();
