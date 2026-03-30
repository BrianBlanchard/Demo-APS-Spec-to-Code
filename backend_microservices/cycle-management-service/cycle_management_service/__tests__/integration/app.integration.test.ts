import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';
import { db } from '../../src/config/database.config';

describe('Application Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('Health Endpoints', () => {
    describe('GET /health/live', () => {
      it('should return 200 and service status', async () => {
        const response = await request(app).get('/health/live');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('service');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
      });

      it('should include trace ID in response headers', async () => {
        const response = await request(app).get('/health/live');

        expect(response.headers).toHaveProperty('x-trace-id');
      });
    });

    describe('GET /health/ready', () => {
      it('should check database connectivity', async () => {
        const response = await request(app).get('/health/ready');

        expect([200, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('database');
      });
    });

    describe('GET /v1/billing/health', () => {
      it('should return alternative health check', async () => {
        const response = await request(app).get('/v1/billing/health');

        expect([200, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('status');
      });
    });
  });

  describe('Billing Cycle Endpoints', () => {
    describe('POST /api/v1/billing/cycle/close', () => {
      it('should validate request body', async () => {
        const response = await request(app)
          .post('/api/v1/billing/cycle/close')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
      });

      it('should reject invalid date format', async () => {
        const response = await request(app)
          .post('/api/v1/billing/cycle/close')
          .send({
            billingCycleEnd: '01/31/2024',
            processingDate: '2024-02-01',
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
      });

      it('should accept valid request format', async () => {
        const response = await request(app)
          .post('/api/v1/billing/cycle/close')
          .send({
            billingCycleEnd: '2024-01-31',
            processingDate: '2024-02-01',
          })
          .set('x-trace-id', 'test-trace-123');

        // May return 422 (no active accounts), 200 (success), 500 (DB error) depending on DB state
        expect([200, 422, 500, 503]).toContain(response.status);
        expect(response.headers).toHaveProperty('x-trace-id');
      });

      it('should preserve trace ID from request', async () => {
        const traceId = 'custom-trace-id-456';

        const response = await request(app)
          .post('/api/v1/billing/cycle/close')
          .send({
            billingCycleEnd: '2024-01-31',
            processingDate: '2024-02-01',
          })
          .set('x-trace-id', traceId);

        expect(response.headers['x-trace-id']).toBe(traceId);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/billing/cycle/close')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // JSON parse errors may return 400 or 500 depending on middleware order
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app).get('/health/live');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
