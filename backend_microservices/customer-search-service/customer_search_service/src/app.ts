import express, { Application } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { contextMiddleware } from './middleware/context.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { createRoutes } from './routes';

export function createApp(): Application {
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: config.cors.origin === '*' ? '*' : config.cors.origin.split(','),
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logging
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500) {
          return 'error';
        }
        return 'info';
      },
    })
  );

  // Context middleware (must be before routes)
  app.use(contextMiddleware);

  // Routes
  app.use(createRoutes());

  // Error handling (must be last)
  app.use(errorMiddleware);

  return app;
}
