import 'dotenv/config';
import { createApp } from './app';
import { initializeDatabase, closeDatabaseConnection } from './config/database.config';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer(): Promise<void> {
  try {
    // Initialize database
    initializeDatabase();
    logger.info('Database initialized');

    // Create and start Express app
    const app = createApp();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server started`, {
        port: PORT,
        host: HOST,
        env: process.env.NODE_ENV || 'development',
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeDatabaseConnection();
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error as Error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

startServer();
