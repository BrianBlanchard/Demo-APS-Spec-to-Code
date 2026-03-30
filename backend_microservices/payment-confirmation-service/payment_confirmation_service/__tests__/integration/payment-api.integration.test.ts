import request from 'supertest';
import express, { Application } from 'express';
import { PaymentController } from '../../src/controllers/payment.controller';
import { HealthController } from '../../src/controllers/health.controller';
import { PaymentService } from '../../src/services/payment.service';
import { AuditService } from '../../src/services/audit.service';
import { PaymentRepository } from '../../src/repositories/payment.repository';
import { contextMiddleware } from '../../src/middleware/context.middleware';
import { errorMiddleware } from '../../src/middleware/error.middleware';
import { PaymentRecord } from '../../src/models/payment.model';

describe('Payment API Integration Tests', () => {
  let app: Application;
  let mockDb: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Setup mock database
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
    };

    mockDb = jest.fn(() => mockQueryBuilder);
    mockDb.raw = jest.fn();

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(contextMiddleware);

    // Initialize services and controllers
    const auditService = new AuditService();
    const paymentRepository = new PaymentRepository(mockDb);
    const paymentService = new PaymentService(paymentRepository, auditService);
    const paymentController = new PaymentController(paymentService);
    const healthController = new HealthController(mockDb);

    // Setup routes
    app.get('/health/live', (req, res) => healthController.healthLive(req, res));
    app.get('/health/ready', (req, res) => healthController.healthReady(req, res));
    app.get('/v1/payment-confirmation/health', (req, res) => healthController.healthV1(req, res));
    app.get('/api/v1/payments/:confirmationNumber', (req, res, next) =>
      paymentController.getPaymentConfirmation(req, res, next)
    );

    // Error handling middleware
    app.use(errorMiddleware);
  });

  describe('GET /api/v1/payments/:confirmationNumber', () => {
    it('should return 200 OK with payment confirmation when found', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-ABC123',
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        payment_amount: 2450.75,
        payment_method: 'eft',
        previous_balance: 2450.75,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const response = await request(app).get('/api/v1/payments/PAY-20240115-ABC123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        paymentConfirmationNumber: 'PAY-20240115-ABC123',
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 2450.75,
        paymentMethod: 'eft',
        previousBalance: 2450.75,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      });
      expect(response.headers['x-trace-id']).toBeDefined();
    });

    it('should return 404 when payment confirmation not found', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const response = await request(app).get('/api/v1/payments/PAY-20240115-NOTFOUND');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        errorCode: 'PAYMENT_NOT_FOUND',
        message: 'Payment confirmation not found',
        traceId: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should return 400 for invalid confirmation number format', async () => {
      const response = await request(app).get('/api/v1/payments/INVALID-FORMAT');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid confirmation number format',
        traceId: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should include trace ID in response headers', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const response = await request(app).get('/api/v1/payments/PAY-20240115-ABC123');

      expect(response.headers['x-trace-id']).toBeDefined();
      expect(response.headers['x-trace-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should use provided trace ID from request header', async () => {
      const customTraceId = '550e8400-e29b-41d4-a716-446655440000';
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/v1/payments/PAY-20240115-ABC123')
        .set('x-trace-id', customTraceId);

      expect(response.headers['x-trace-id']).toBe(customTraceId);
      expect(response.body.traceId).toBe(customTraceId);
    });

    it('should handle database connection errors', async () => {
      mockQueryBuilder.first.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/v1/payments/PAY-20240115-ABC123');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      });
    });

    it('should handle credit card payments', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240116-XYZ789',
        transaction_id: '9876543210987654',
        account_id: '98765432109',
        payment_amount: 1250.5,
        payment_method: 'credit_card',
        previous_balance: 1250.5,
        new_balance: 0.0,
        payment_date: '2024-01-16',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const response = await request(app).get('/api/v1/payments/PAY-20240116-XYZ789');

      expect(response.status).toBe(200);
      expect(response.body.paymentMethod).toBe('credit_card');
      expect(response.body.status).toBe('pending');
    });

    it('should handle debit card payments', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240117-DEF456',
        transaction_id: '1111222233334444',
        account_id: '11111111111',
        payment_amount: 500.0,
        payment_method: 'debit_card',
        previous_balance: 500.0,
        new_balance: 0.0,
        payment_date: '2024-01-17',
        status: 'failed',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const response = await request(app).get('/api/v1/payments/PAY-20240117-DEF456');

      expect(response.status).toBe(200);
      expect(response.body.paymentMethod).toBe('debit_card');
      expect(response.body.status).toBe('failed');
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'UP',
        timestamp: expect.any(String),
      });
    });

    it('should not check database connection', async () => {
      await request(app).get('/health/live');

      expect(mockDb.raw).not.toHaveBeenCalled();
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 OK when database is healthy', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'UP',
        database: 'UP',
        timestamp: expect.any(String),
      });
      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return 503 when database is unhealthy', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'DOWN',
        database: 'DOWN',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /v1/payment-confirmation/health', () => {
    it('should return 200 OK with service info when database is healthy', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      const response = await request(app).get('/v1/payment-confirmation/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'UP',
        service: 'payment-confirmation',
        version: '1.0.0',
        database: 'UP',
        timestamp: expect.any(String),
      });
    });

    it('should return 503 when database is unhealthy', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/v1/payment-confirmation/health');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'DOWN',
        service: 'payment-confirmation',
        version: '1.0.0',
        database: 'DOWN',
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle validation errors consistently', async () => {
      const response = await request(app).get('/api/v1/payments/invalid');

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
      expect(response.body.traceId).toBeDefined();
    });

    it('should include timestamp in error responses', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const response = await request(app).get('/api/v1/payments/PAY-20240115-ABC123');

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should propagate trace ID through error responses', async () => {
      const customTraceId = '123e4567-e89b-12d3-a456-426614174000';
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/v1/payments/PAY-20240115-ABC123')
        .set('x-trace-id', customTraceId);

      expect(response.body.traceId).toBe(customTraceId);
    });
  });

  describe('End-to-End Payment Flow', () => {
    it('should complete full payment retrieval flow', async () => {
      const mockRecord: PaymentRecord = {
        id: 1,
        payment_confirmation_number: 'PAY-20240115-E2E123',
        transaction_id: '5555666677778888',
        account_id: '55555555555',
        payment_amount: 3000.0,
        payment_method: 'eft',
        previous_balance: 3000.0,
        new_balance: 0.0,
        payment_date: '2024-01-15',
        status: 'posted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.first.mockResolvedValue(mockRecord);

      const response = await request(app).get('/api/v1/payments/PAY-20240115-E2E123');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.paymentConfirmationNumber).toBe('PAY-20240115-E2E123');
      expect(response.body.paymentAmount).toBe(3000.0);
      expect(response.body.previousBalance).toBe(3000.0);
      expect(response.body.newBalance).toBe(0.0);

      // Verify trace ID
      expect(response.headers['x-trace-id']).toBeDefined();

      // Verify database interaction
      expect(mockDb).toHaveBeenCalledWith('payments');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'payment_confirmation_number',
        'PAY-20240115-E2E123'
      );
    });
  });
});
