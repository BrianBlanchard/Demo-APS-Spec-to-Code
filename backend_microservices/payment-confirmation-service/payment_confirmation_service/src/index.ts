import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import knex from 'knex';
import { getKnexConfig } from './config/database.config';
import { contextMiddleware } from './middleware/context.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentService } from './services/payment.service';
import { AuditService } from './services/audit.service';
import { PaymentController } from './controllers/payment.controller';
import { HealthController } from './controllers/health.controller';
import { createLogger } from './config/logger.config';

dotenv.config();

const logger = createLogger('Application');
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app: Application = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(contextMiddleware);

// Database connection
const db = knex(getKnexConfig());

// Initialize services
const auditService = new AuditService();
const paymentRepository = new PaymentRepository(db);
const paymentService = new PaymentService(paymentRepository, auditService);

// Initialize controllers
const paymentController = new PaymentController(paymentService);
const healthController = new HealthController(db);

// Health routes
app.get('/health/live', (req, res) => healthController.healthLive(req, res));
app.get('/health/ready', (req, res) => healthController.healthReady(req, res));
app.get('/v1/payment-confirmation/health', (req, res) => healthController.healthV1(req, res));

// API routes
app.get('/api/v1/payments/:confirmationNumber', (req, res, next) =>
  paymentController.getPaymentConfirmation(req, res, next)
);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  logger.info('Shutting down gracefully...');
  await db.destroy();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Payment Confirmation Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, db, server };
