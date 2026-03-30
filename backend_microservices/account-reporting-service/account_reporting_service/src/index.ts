import knex from 'knex';
import { createApp } from './app';
import { getKnexConfig } from './config/database.config';
import { getAppConfig } from './config/app.config';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    const config = getAppConfig();
    const db = knex(getKnexConfig());

    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connection established');

    const app = createApp(db);

    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.nodeEnv,
        },
        'Account Reporting Service started successfully'
      );
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await db.destroy();
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await db.destroy();
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
