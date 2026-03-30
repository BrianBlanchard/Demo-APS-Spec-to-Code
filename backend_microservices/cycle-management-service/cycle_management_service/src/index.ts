import { createApp } from './app';
import { envConfig } from './config/env.config';
import { logger } from './config/logger.config';
import { db } from './config/database.config';

const app = createApp();

const server = app.listen(envConfig.port, () => {
  logger.info(
    {
      port: envConfig.port,
      nodeEnv: envConfig.nodeEnv,
      service: envConfig.serviceName,
      version: envConfig.serviceVersion,
    },
    `Server started on port ${envConfig.port}`
  );
});

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Received shutdown signal');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await db.destroy();
      logger.info('Database connection closed');
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
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
