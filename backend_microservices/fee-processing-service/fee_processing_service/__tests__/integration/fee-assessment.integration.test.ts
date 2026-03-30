import request from 'supertest';
import { createApp } from '../../src/app';
import { FeeType } from '../../src/types/fee-types';

// Mock dependencies
jest.mock('../../src/config/database.config', () => {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn(),
  };

  return {
    db: Object.assign(jest.fn().mockReturnValue(mockQueryBuilder), {
      fn: { now: jest.fn().mockReturnValue('NOW()') },
      raw: jest.fn().mockResolvedValue(null),
    }),
  };
});

describe('Fee Assessment Integration Tests', () => {
  let app: Express.Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /api/v1/fees/assess', () => {
    it('should return 400 for invalid request', async () => {
      const invalidRequest = {
        accountId: '123', // Too short
        feeType: FeeType.LATE_PAYMENT,
        amount: 35.0,
        reason: 'Test',
      };

      const response = await request(app)
        .post('/api/v1/fees/assess')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('errorCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('traceId');
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 for healthy service', async () => {
      const response = await request(app).get('/health/ready').expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 for live service', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
    });
  });
});
