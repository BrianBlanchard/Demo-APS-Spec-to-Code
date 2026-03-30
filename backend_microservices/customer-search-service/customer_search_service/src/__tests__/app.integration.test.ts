import request from 'supertest';
import { createApp } from '../app';
import { Application } from 'express';

describe('App Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createApp();
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/v1/customers/search')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
    });
  });

  describe('Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/v1/customers/search')
        .send({ query: 'test' })
        .set('Content-Type', 'application/json');

      // Will fail auth but body should be parsed
      expect(response.status).not.toBe(400);
    });

    it('should parse URL-encoded bodies', async () => {
      const response = await request(app)
        .post('/api/v1/customers/search')
        .send('query=test')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).not.toBe(400);
    });
  });

  describe('Request Context', () => {
    it('should add trace ID to response headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-trace-id']).toBeDefined();
    });

    it('should preserve provided trace ID', async () => {
      const traceId = 'custom-trace-id';
      const response = await request(app)
        .get('/health')
        .set('x-trace-id', traceId);

      expect(response.headers['x-trace-id']).toBe(traceId);
    });
  });

  describe('Health Endpoints', () => {
    it('should respond to /health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should respond to /health/live endpoint', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
    });

    it('should respond to /health/ready endpoint', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
    });

    it('should respond to versioned health endpoint', async () => {
      const response = await request(app).get('/v1/customer-search-service/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('API Routes', () => {
    it('should route to customer search endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      // Should fail auth but route exists
      expect(response.status).not.toBe(404);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with proper format', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('traceId');
    });

    it('should include trace ID in error responses', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      expect(response.body.traceId).toBeDefined();
    });
  });

  describe('Content-Type Handling', () => {
    it('should return JSON responses', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Security Headers', () => {
    it('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      expect(response.body.message).not.toContain('stack');
      expect(response.body.message).not.toContain('Error:');
    });
  });
});
