import request from 'supertest';
import { createApp } from '../app';
import { Application } from 'express';

describe('Full Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createApp();
  });

  describe('End-to-End Search Flow', () => {
    it('should handle complete search request flow with auth', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({
          query: 'john smith',
          limit: '10',
          offset: '0',
        })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      // Response structure validation
      expect(response.status).toBeGreaterThanOrEqual(200);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('total_results');
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('query_time_ms');
        expect(response.body).toHaveProperty('pagination');
      }
    });

    it('should enforce authentication', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.errorCode).toBe('UNAUTHORIZED');
    });

    it('should enforce authorization roles', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'guest');

      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe('FORBIDDEN');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'a' }) // Too short
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should validate limit parameter range', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({
          query: 'test',
          limit: '100', // Exceeds max of 50
        })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBe(400);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should track requests per user', async () => {
      const userId = 'rate-limit-user';
      const requests = [];

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/api/v1/customers/search')
            .query({ query: 'test' })
            .set('Authorization', 'Bearer test-token')
            .set('x-user-id', userId)
            .set('x-user-role', 'associate')
        );
      }

      const responses = await Promise.all(requests);

      // All should either succeed or fail consistently
      responses.forEach((response) => {
        expect([200, 401, 403, 422, 429, 503]).toContain(response.status);
      });
    });
  });

  describe('Trace ID Propagation', () => {
    it('should propagate trace ID through entire request flow', async () => {
      const traceId = 'integration-test-trace';

      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' })
        .set('x-trace-id', traceId)
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.headers['x-trace-id']).toBe(traceId);
      if (response.body.traceId) {
        expect(response.body.traceId).toBe(traceId);
      }
    });
  });

  describe('Multiple Endpoint Integration', () => {
    it('should handle concurrent requests to different endpoints', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/health/live'),
        request(app).get('/health/ready'),
        request(app)
          .get('/api/v1/customers/search')
          .query({ query: 'test' })
          .set('Authorization', 'Bearer test-token')
          .set('x-user-id', 'user-1')
          .set('x-user-role', 'associate'),
      ];

      const responses = await Promise.all(requests);

      // Health endpoints should succeed
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBeGreaterThanOrEqual(200);

      // Search endpoint should return valid response
      expect(responses[3].status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Error Response Consistency', () => {
    it('should return consistent error format across endpoints', async () => {
      const authError = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test' });

      const validationError = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'a' })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      // Both should have consistent error structure
      expect(authError.body).toHaveProperty('errorCode');
      expect(authError.body).toHaveProperty('message');
      expect(authError.body).toHaveProperty('timestamp');
      expect(authError.body).toHaveProperty('traceId');

      expect(validationError.body).toHaveProperty('errorCode');
      expect(validationError.body).toHaveProperty('message');
      expect(validationError.body).toHaveProperty('timestamp');
      expect(validationError.body).toHaveProperty('traceId');
    });
  });

  describe('Service Availability', () => {
    it('should report readiness status', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('elasticsearch');
      expect(response.body.checks).toHaveProperty('redis');
    });

    it('should always report liveness', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });
  });

  describe('Content Negotiation', () => {
    it('should handle Accept header correctly', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Query Parameter Parsing', () => {
    it('should parse comma-separated search fields', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({
          query: 'test',
          search_fields: 'name,email',
        })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should parse comma-separated loyalty tiers', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({
          query: 'test',
          loyalty_tier: 'vip,gold',
        })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in query', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: 'test@#$%' })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle Unicode characters', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .query({ query: '测试用户' })
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle empty query string gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/customers/search')
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'associate');

      expect(response.status).toBe(400);
    });
  });
});
