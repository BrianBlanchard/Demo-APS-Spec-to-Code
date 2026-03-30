import dotenv from 'dotenv';
import { createApp } from './app';
import { getAppConfig } from './config/app.config';
import { logger } from './config/logger.config';
import { closeDatabase } from './config/database.config';

dotenv.config();

const startServer = (): void => {
  const config = getAppConfig();
  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down gracefully...');

    server.close(async () => {
      logger.info('HTTP server closed');

      await closeDatabase();
      logger.info('Database connection closed');

      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
