import express, { Application } from 'express';
import { Knex } from 'knex';
import { contextMiddleware } from './middlewares/context';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { createHealthRoutes } from './routes/healthRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { UserRepository } from './repositories/userRepository';
import { AuditRepository } from './repositories/auditRepository';
import { AuditService } from './services/auditService';
import { UserService } from './services/userService';
import { UserController } from './controllers/userController';
import { config } from './config/config';

export const createApp = (db: Knex): Application => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS (simple implementation for development)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Trace-Id, X-Admin-Id');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Context and logging middleware
  app.use(contextMiddleware);
  app.use(requestLogger);

  // Initialize repositories
  const userRepository = new UserRepository(db);
  const auditRepository = new AuditRepository(db);

  // Initialize services
  const auditService = new AuditService(auditRepository);
  const userService = new UserService(userRepository, auditService);

  // Initialize controllers
  const userController = new UserController(userService);

  // Routes
  app.use('/', createHealthRoutes());
  app.use('/api/v1', createUserRoutes(userController));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
