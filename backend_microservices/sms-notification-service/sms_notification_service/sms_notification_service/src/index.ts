import { createApp } from './app';
import { config, validateConfig } from './config/config';
import { closeDatabase } from './config/database';
import { logger } from './services/logger.service';

async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Create and start app
    const app = createApp();

    const server = app.listen(config.app.port, () => {
      logger.info(
        {
          port: config.app.port,
          nodeEnv: config.app.nodeEnv,
        },
        `SMS Notification Service started successfully`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeDatabase();
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

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
