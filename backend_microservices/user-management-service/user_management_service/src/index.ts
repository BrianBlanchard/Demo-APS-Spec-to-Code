import { createApp } from './app';
import { createDatabaseConnection, closeDatabaseConnection } from './config/database';
import { config } from './config/config';
import { logger } from './config/logger';

const startServer = async (): Promise<void> => {
  try {
    // Create database connection
    const db = createDatabaseConnection();

    // Create Express app
    const app = createApp(db);

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
          service: config.serviceName,
        },
        'Server started successfully'
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutdown signal received');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeDatabaseConnection();
          logger.info('Database connection closed');
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
};

startServer();
