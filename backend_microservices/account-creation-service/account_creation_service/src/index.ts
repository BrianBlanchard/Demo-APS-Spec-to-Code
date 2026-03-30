import { Application } from 'express';
import { createApp } from './app';
import { createDatabasePool, closeDatabasePool } from './database/connection';
import config from './config/config';
import logger from './logger/logger';

let server: ReturnType<Application['listen']> | null = null;

async function start(): Promise<void> {
  try {
    // Create database pool
    const pool = createDatabasePool();

    // Create Express app
    const app = createApp(pool);

    // Start server
    server = app.listen(config.server.port, () => {
      logger.info(
        {
          port: config.server.port,
          env: config.server.env,
          apiBasePath: `${config.server.apiBasePath}/${config.server.apiVersion}/${config.server.capabilityName}`,
        },
        'Account Creation Service started successfully'
      );
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

async function stop(): Promise<void> {
  logger.info('Shutting down server...');

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  await closeDatabasePool();
  logger.info('Server shutdown complete');
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  void stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  void stop();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  void stop();
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  void stop();
});

// Start the server
void start();
