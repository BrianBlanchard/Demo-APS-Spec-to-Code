import express, { Application } from 'express';
import cors from 'cors';
import { contextMiddleware } from './middleware/context.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { AccountBalanceController } from './controllers/account-balance.controller';
import { HealthController } from './controllers/health.controller';
import { config } from './config';
import { logger } from './utils/logger';

export const createApp = (
  accountBalanceController: AccountBalanceController,
  healthController: HealthController
): Application => {
  const app = express();

  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());
  app.use(contextMiddleware);

  app.use('/api/v1', accountBalanceController.router);
  app.use('/', healthController.router);

  app.use(errorMiddleware);

  logger.info('Express application configured');

  return app;
};
