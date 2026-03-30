import request from 'supertest';
import { newDb } from 'pg-mem';
import { Knex } from 'knex';
import express, { Application } from 'express';
import cors from 'cors';
import { Router } from 'express';
import { TransactionCategoryRepository } from '../../src/repositories/transaction-category.repository';
import { AuditService } from '../../src/services/audit.service';
import { TransactionCategorizationService } from '../../src/services/transaction-categorization.service';
import { HealthController } from '../../src/controllers/health.controller';
import { TransactionCategorizationController } from '../../src/controllers/transaction-categorization.controller';
import { validateRequest } from '../../src/middleware/validation.middleware';
import { errorHandler } from '../../src/middleware/error-handler.middleware';
import { requestContextMiddleware } from '../../src/middleware/request-context.middleware';
import { CategorizeRequestSchema } from '../../src/dto/categorize-request.dto';

// Don't mock the logger for integration tests - use the real logger
// The logger output will be suppressed in test mode anyway

describe('API Integration Tests', () => {
  let app: Application;
  let db: Knex;

  beforeAll(async () => {
    // Create in-memory database
    const pgMem = newDb();
    db = pgMem.adapters.createKnex() as any;

    // Create table
    await db.schema.createTable('transaction_categories', (table) => {
      table.string('category_code', 4).primary();
      table.string('category_name', 255).notNullable();
      table.string('transaction_type', 2).notNullable();
      table.string('category_group', 50).notNullable();
      table.float('interest_rate').notNullable();
      table.boolean('rewards_eligible').notNullable();
      table.float('rewards_rate').notNullable();
    });

    // Insert test data
    await db('transaction_categories').insert([
      {
        category_code: '5812',
        category_name: 'Eating Places and Restaurants',
        transaction_type: '01',
        category_group: 'dining',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 2.0,
      },
      {
        category_code: '5411',
        category_name: 'Grocery Stores and Supermarkets',
        transaction_type: '01',
        category_group: 'groceries',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 3.0,
      },
      {
        category_code: '5541',
        category_name: 'Service Stations',
        transaction_type: '01',
        category_group: 'gas',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 2.5,
      },
      {
        category_code: '6011',
        category_name: 'Automated Cash Disbursements',
        transaction_type: '02',
        category_group: 'cash_advance',
        interest_rate: 24.99,
        rewards_eligible: false,
        rewards_rate: 0.0,
      },
    ]);

    // Initialize app
    app = express();

    // Initialize repositories
    const categoryRepository = new TransactionCategoryRepository(db);

    // Initialize services
    const auditService = new AuditService();
    const categorizationService = new TransactionCategorizationService(
      categoryRepository,
      auditService
    );

    // Initialize controllers
    const healthController = new HealthController(categoryRepository);
    const categorizationController = new TransactionCategorizationController(
      categorizationService
    );

    // Middleware
    app.use(express.json());
    app.use(cors());
    // Skip pinoHttp in tests to avoid logger complexity
    app.use(requestContextMiddleware);

    // Health routes
    const healthRouter = Router();
    healthRouter.get('/live', healthController.checkLiveness.bind(healthController));
    healthRouter.get('/ready', healthController.checkReadiness.bind(healthController));
    app.use('/health', healthRouter);

    // API routes
    const apiRouter = Router();
    apiRouter.post(
      '/v1/transactions/categorize',
      validateRequest(CategorizeRequestSchema),
      categorizationController.categorizeTransaction.bind(categorizationController)
    );
    apiRouter.get(
      '/v1/transaction-categorization/health',
      healthController.checkHealth.bind(healthController)
    );
    app.use('/api', apiRouter);

    // Error handler (must be last)
    app.use(errorHandler);
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/transactions/categorize', () => {
    it('should categorize restaurant transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Restaurant',
          amount: 50.0,
          description: 'Lunch payment',
        })
        .expect(200);

      expect(response.body).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5812',
        categoryName: 'Eating Places and Restaurants',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      });
    });

    it('should categorize grocery transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5411',
          merchantName: 'Grocery Store',
          amount: 125.5,
          description: 'Weekly groceries',
        })
        .expect(200);

      expect(response.body).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5411',
        categoryName: 'Grocery Stores and Supermarkets',
        categoryGroup: 'groceries',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 3.0,
      });
    });

    it('should categorize gas station transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5541',
          merchantName: 'Gas Station',
          amount: 45.0,
          description: 'Fuel purchase',
        })
        .expect(200);

      expect(response.body).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '5541',
        categoryName: 'Service Stations',
        categoryGroup: 'gas',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.5,
      });
    });

    it('should categorize cash advance transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '6011',
          merchantName: 'ATM',
          amount: 100.0,
          description: 'Cash withdrawal',
        })
        .expect(200);

      expect(response.body).toEqual({
        transactionType: '02',
        transactionTypeName: 'Cash Advance',
        transactionCategory: '6011',
        categoryName: 'Automated Cash Disbursements',
        categoryGroup: 'cash_advance',
        interestRate: 24.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      });
    });

    it('should return default category for unknown MCC', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '9999',
          merchantName: 'Unknown Merchant',
          amount: 100.0,
          description: 'Unknown transaction',
        })
        .expect(200);

      expect(response.body).toEqual({
        transactionType: '01',
        transactionTypeName: 'Purchase',
        transactionCategory: '9999',
        categoryName: 'Other',
        categoryGroup: 'other',
        interestRate: 19.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      });
    });

    it('should return 400 for invalid MCC format', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: 'ABCD',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('message', 'Request validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for MCC too short', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '123',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for MCC too long', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '12345',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing merchantName', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty merchantName', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: '',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for merchantName too long', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'A'.repeat(256),
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should accept merchantName at max length', async () => {
      await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'A'.repeat(255),
          amount: 50.0,
          description: 'Test',
        })
        .expect(200);
    });

    it('should return 400 for negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: -50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for zero amount', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should accept small positive amount', async () => {
      await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 0.01,
          description: 'Test',
        })
        .expect(200);
    });

    it('should accept large amount', async () => {
      await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 999999.99,
          description: 'Test',
        })
        .expect(200);
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 50.0,
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty description', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: '',
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for description too long', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: 'D'.repeat(501),
        })
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should accept description at max length', async () => {
      await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test Merchant',
          amount: 50.0,
          description: 'D'.repeat(500),
        })
        .expect(200);
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({})
        .expect(400);

      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should include traceId in error response', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: 'ABCD',
          merchantName: 'Test',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('traceId');
    });

    it('should include timestamp in error response', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: 'ABCD',
          merchantName: 'Test',
          amount: 50.0,
          description: 'Test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle Content-Type application/json', async () => {
      await request(app)
        .post('/api/v1/transactions/categorize')
        .set('Content-Type', 'application/json')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test',
          amount: 50.0,
          description: 'Test',
        })
        .expect(200);
    });
  });

  describe('GET /health/live', () => {
    it('should return UP status', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should not include database status', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body.database).toBeUndefined();
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return positive uptime', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return UP status when database is healthy', async () => {
      const response = await request(app).get('/health/ready').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'UP',
          database: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should include database status', async () => {
      const response = await request(app).get('/health/ready').expect(200);

      expect(response.body.database).toBe('UP');
    });
  });

  describe('GET /api/v1/transaction-categorization/health', () => {
    it('should return UP status when database is healthy', async () => {
      const response = await request(app)
        .get('/api/v1/transaction-categorization/health')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'UP',
          database: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should include database status', async () => {
      const response = await request(app)
        .get('/api/v1/transaction-categorization/health')
        .expect(200);

      expect(response.body.database).toBe('UP');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/health/live');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle OPTIONS request', async () => {
      await request(app).options('/api/v1/transactions/categorize').expect(204);
    });
  });

  describe('Request Context', () => {
    it('should add trace ID to response headers', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Test',
          amount: 50.0,
          description: 'Test',
        });

      expect(response.headers).toHaveProperty('x-trace-id');
    });
  });

  describe('Error scenarios', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/transactions/categorize')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express returns 400 or 500 for malformed JSON depending on configuration
      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('errorCode');
    });

    it('should return 404 for unknown routes', async () => {
      await request(app).get('/unknown-route').expect(404);
    });

    it('should return 404 for POST to health endpoint', async () => {
      await request(app).post('/health/live').expect(404);
    });

    it('should return 404 for GET to categorize endpoint', async () => {
      await request(app).get('/api/v1/transactions/categorize').expect(404);
    });
  });

  describe('Multiple requests', () => {
    it('should handle concurrent requests', async () => {
      const requests = [
        request(app).post('/api/v1/transactions/categorize').send({
          merchantCategoryCode: '5812',
          merchantName: 'Restaurant 1',
          amount: 50.0,
          description: 'Test 1',
        }),
        request(app).post('/api/v1/transactions/categorize').send({
          merchantCategoryCode: '5411',
          merchantName: 'Grocery 1',
          amount: 100.0,
          description: 'Test 2',
        }),
        request(app).post('/api/v1/transactions/categorize').send({
          merchantCategoryCode: '5541',
          merchantName: 'Gas Station 1',
          amount: 45.0,
          description: 'Test 3',
        }),
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);

      expect(responses[0].body.categoryGroup).toBe('dining');
      expect(responses[1].body.categoryGroup).toBe('groceries');
      expect(responses[2].body.categoryGroup).toBe('gas');
    });

    it('should handle sequential requests', async () => {
      const response1 = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5812',
          merchantName: 'Restaurant',
          amount: 50.0,
          description: 'Test',
        });

      const response2 = await request(app)
        .post('/api/v1/transactions/categorize')
        .send({
          merchantCategoryCode: '5411',
          merchantName: 'Grocery',
          amount: 100.0,
          description: 'Test',
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.categoryGroup).toBe('dining');
      expect(response2.body.categoryGroup).toBe('groceries');
    });
  });
});
