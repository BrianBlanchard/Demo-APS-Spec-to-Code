import { createApp } from './app';
import { initializeDatabase, closeDatabase } from './infrastructure/database';
import { initializeCache, closeCache } from './infrastructure/cache';
import { config } from './infrastructure/config';
import { logger } from './infrastructure/logger';

async function start(): Promise<void> {
  try {
    // Initialize infrastructure
    initializeDatabase();
    await initializeCache();

    // Create and start server
    const app = createApp();
    const server = app.listen(config.server.port, () => {
      logger.info(
        {
          port: config.server.port,
          env: config.server.env,
        },
        'Server started successfully'
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutdown signal received');

      server.close(async () => {
        logger.info('HTTP server closed');

        await closeDatabase();
        await closeCache();

        logger.info('Application shutdown complete');
        process.exit(0);
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
    logger.error({ error }, 'Failed to start application');
    process.exit(1);
  }
}

start();
