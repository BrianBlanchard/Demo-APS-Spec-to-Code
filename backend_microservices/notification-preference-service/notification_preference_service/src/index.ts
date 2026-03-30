import { createApp } from './app';
import { appConfig } from './config/app.config';
import { logger } from './utils/logger';

const { app, db } = createApp();

const server = app.listen(appConfig.port, () => {
  logger.info(`Server running on port ${appConfig.port} in ${appConfig.nodeEnv} mode`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await db.destroy();
      logger.info('Database connections closed');
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

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
