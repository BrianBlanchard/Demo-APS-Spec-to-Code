import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { database } from './repositories/database';
import { elasticsearchClient } from './repositories/elasticsearch.client';
import { redisClient } from './repositories/redis.client';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      nodeEnv: config.node_env,
    },
    'Customer Search Service started'
  );
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await database.close();
      await elasticsearchClient.close();
      await redisClient.close();
      logger.info('All connections closed');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await database.close();
      await elasticsearchClient.close();
      await redisClient.close();
      logger.info('All connections closed');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  });
});
