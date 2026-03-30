import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './config/logger';
import { closeDatabase } from './config/database';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`Card Replacement Service is running on port ${PORT}`);
  logger.info(`Health endpoint: http://localhost:${PORT}/health`);
  logger.info(`API base path: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, closing server gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeDatabase();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
