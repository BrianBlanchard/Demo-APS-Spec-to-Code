import { createApp } from './app';
import config from './config';
import { closeDatabaseConnection } from './database/connection';
import logger from './utils/logger';

const app = createApp();

const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(
    `Server running on ${config.server.host}:${config.server.port} in ${config.server.env} mode`
  );
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    await closeDatabaseConnection();

    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    await closeDatabaseConnection();

    process.exit(0);
  });
});
