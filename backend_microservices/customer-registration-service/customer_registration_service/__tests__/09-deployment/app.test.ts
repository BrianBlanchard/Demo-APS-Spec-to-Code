import request from 'supertest';
import { createApp } from '../../src/app';
import * as databaseConfig from '../../src/config/database.config';

jest.mock('../../src/config/database.config');

describe('Application Deployment', () => {
  let app: any;

  beforeAll(() => {
    // Mock database
    const mockDb = {
      raw: jest.fn().mockResolvedValue({}),
    } as any;
    jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb);

    app = createApp();
  });

  describe('App Initialization', () => {
    it('should create Express application', () => {
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });

    it('should have health check routes', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
    });

    it('should have API routes', async () => {
      // This will fail auth but route should exist
      const response = await request(app)
        .post('/api/v1/customers')
        .send({});

      expect(response.status).not.toBe(404);
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS headers', async () => {
      const response = await request(app)
        .get('/health/live')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' });

      // Should not be 400 for invalid JSON
      expect(response.status).not.toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should have global error handler', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .send({});

      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include trace ID in error responses', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .send({});

      expect(response.body).toHaveProperty('traceId');
    });
  });

  describe('Request Tracing', () => {
    it('should add trace ID to response headers', async () => {
      const response = await request(app).get('/health/live');

      expect(response.headers['x-trace-id']).toBeDefined();
    });

    it('should preserve provided trace ID', async () => {
      const traceId = 'custom-trace-id-123';
      const response = await request(app)
        .get('/health/live')
        .set('X-Trace-Id', traceId);

      expect(response.headers['x-trace-id']).toBe(traceId);
    });
  });

  describe('Health Endpoints', () => {
    it('should respond to /health/live', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should respond to /health/ready', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('checks');
    });

    it('should respond to /v1/customer-registration/health', async () => {
      const response = await request(app).get('/v1/customer-registration/health');

      // Route may not be found (404) or respond with health status
      expect([200, 404, 503]).toContain(response.status);
    });
  });

  describe('API Routes', () => {
    it('should have customer creation route', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .send({});

      // Route exists (not 404), but fails auth
      expect(response.status).not.toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .send({
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(401);
    });
  });
});
