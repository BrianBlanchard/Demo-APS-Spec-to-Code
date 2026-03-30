import { createApp } from './app';
import { serverConfig } from './config/server.config';
import logger from './utils/logger';

const app = createApp();

const server = app.listen(serverConfig.port, () => {
  logger.info(
    {
      port: serverConfig.port,
      env: serverConfig.env,
    },
    'Transaction Categorization Service started'
  );
});

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info('Received shutdown signal, closing server gracefully...');

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connection
    const db = app.locals.db;
    if (db) {
      await db.destroy();
      logger.info('Database connection closed');
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
