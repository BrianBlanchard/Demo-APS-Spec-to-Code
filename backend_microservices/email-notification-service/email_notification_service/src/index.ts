import { createApp } from './app';
import { appConfig } from './config/app.config';
import { logger } from './config/logger.config';
import { closeDatabaseConnection } from './database/database';

const app = createApp();

const server = app.listen(appConfig.port, () => {
  logger.info(
    {
      port: appConfig.port,
      env: appConfig.env,
    },
    'Email Notification Service started successfully'
  );
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Received shutdown signal');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeDatabaseConnection();
      logger.info('Application shut down gracefully');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
