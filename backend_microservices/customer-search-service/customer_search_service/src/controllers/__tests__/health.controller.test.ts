import { Request, Response } from 'express';
import { HealthController } from '../health.controller';

// Mock the repository modules
jest.mock('../../repositories/database', () => ({
  database: {
    healthCheck: jest.fn(),
  },
}));

jest.mock('../../repositories/elasticsearch.client', () => ({
  elasticsearchClient: {
    healthCheck: jest.fn(),
  },
}));

jest.mock('../../repositories/redis.client', () => ({
  redisClient: {
    healthCheck: jest.fn(),
  },
}));

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDatabase: { healthCheck: jest.Mock };
  let mockElasticsearch: { healthCheck: jest.Mock };
  let mockRedis: { healthCheck: jest.Mock };

  beforeEach(() => {
    // Create controller instance
    controller = new HealthController();

    // Setup mock request
    mockRequest = {
      headers: {},
      query: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Get mocked repository instances
    const { database } = require('../../repositories/database');
    const { elasticsearchClient } = require('../../repositories/elasticsearch.client');
    const { redisClient } = require('../../repositories/redis.client');

    mockDatabase = database;
    mockElasticsearch = elasticsearchClient;
    mockRedis = redisClient;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return 200 status with ok message', async () => {
      // Setup - capture the timestamp before execution
      const beforeTimestamp = new Date();

      // Execute
      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
        })
      );

      // Verify timestamp is valid ISO string and recent
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const responseTimestamp = new Date(responseCall.timestamp);
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTimestamp.getTime());
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should return valid ISO timestamp format', async () => {
      // Execute
      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      // Assert
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = responseCall.timestamp;

      // Verify it's a valid ISO string
      expect(() => new Date(timestamp).toISOString()).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should not call any external dependencies', async () => {
      // Execute
      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      // Assert - verify no health checks were called
      expect(mockDatabase.healthCheck).not.toHaveBeenCalled();
      expect(mockElasticsearch.healthCheck).not.toHaveBeenCalled();
      expect(mockRedis.healthCheck).not.toHaveBeenCalled();
    });

    it('should handle multiple concurrent requests independently', async () => {
      // Execute - fire multiple requests concurrently
      await Promise.all([
        controller.healthCheck(mockRequest as Request, mockResponse as Response),
        controller.healthCheck(mockRequest as Request, mockResponse as Response),
        controller.healthCheck(mockRequest as Request, mockResponse as Response),
      ]);

      // Assert - all should return 200
      expect(mockResponse.status).toHaveBeenCalledTimes(3);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(3);
    });
  });

  describe('liveness', () => {
    it('should return 200 status with alive message', async () => {
      // Setup - capture the timestamp before execution
      const beforeTimestamp = new Date();

      // Execute
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'alive',
          timestamp: expect.any(String),
        })
      );

      // Verify timestamp is valid ISO string and recent
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const responseTimestamp = new Date(responseCall.timestamp);
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTimestamp.getTime());
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should return valid ISO timestamp format', async () => {
      // Execute
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      // Assert
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = responseCall.timestamp;

      // Verify it's a valid ISO string
      expect(() => new Date(timestamp).toISOString()).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should not call any external dependencies', async () => {
      // Execute
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      // Assert - verify no health checks were called
      expect(mockDatabase.healthCheck).not.toHaveBeenCalled();
      expect(mockElasticsearch.healthCheck).not.toHaveBeenCalled();
      expect(mockRedis.healthCheck).not.toHaveBeenCalled();
    });

    it('should handle multiple concurrent requests independently', async () => {
      // Execute - fire multiple requests concurrently
      await Promise.all([
        controller.liveness(mockRequest as Request, mockResponse as Response),
        controller.liveness(mockRequest as Request, mockResponse as Response),
        controller.liveness(mockRequest as Request, mockResponse as Response),
      ]);

      // Assert - all should return 200
      expect(mockResponse.status).toHaveBeenCalledTimes(3);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledTimes(3);
    });
  });

  describe('readiness', () => {
    describe('when all dependencies are healthy', () => {
      it('should return 200 status with ready message', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        const beforeTimestamp = new Date();

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockDatabase.healthCheck).toHaveBeenCalledTimes(1);
        expect(mockElasticsearch.healthCheck).toHaveBeenCalledTimes(1);
        expect(mockRedis.healthCheck).toHaveBeenCalledTimes(1);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'ready',
            checks: {
              database: true,
              elasticsearch: true,
              redis: true,
            },
            timestamp: expect.any(String),
          })
        );

        // Verify timestamp
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        const responseTimestamp = new Date(responseCall.timestamp);
        expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeTimestamp.getTime());
      });

      it('should return valid ISO timestamp format', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        const timestamp = responseCall.timestamp;

        expect(() => new Date(timestamp).toISOString()).not.toThrow();
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    describe('when database is unhealthy', () => {
      it('should return 503 status with not ready message', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(false);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: false,
              elasticsearch: true,
              redis: true,
            },
            timestamp: expect.any(String),
          })
        );
      });
    });

    describe('when elasticsearch is unhealthy', () => {
      it('should return 503 status with not ready message', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(false);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: true,
              elasticsearch: false,
              redis: true,
            },
            timestamp: expect.any(String),
          })
        );
      });
    });

    describe('when redis is unhealthy', () => {
      it('should return 503 status with not ready message', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(false);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: true,
              elasticsearch: true,
              redis: false,
            },
            timestamp: expect.any(String),
          })
        );
      });
    });

    describe('when multiple dependencies are unhealthy', () => {
      it('should return 503 when database and elasticsearch are unhealthy', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(false);
        mockElasticsearch.healthCheck.mockResolvedValue(false);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: false,
              elasticsearch: false,
              redis: true,
            },
          })
        );
      });

      it('should return 503 when database and redis are unhealthy', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(false);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(false);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: false,
              elasticsearch: true,
              redis: false,
            },
          })
        );
      });

      it('should return 503 when elasticsearch and redis are unhealthy', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(false);
        mockRedis.healthCheck.mockResolvedValue(false);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: true,
              elasticsearch: false,
              redis: false,
            },
          })
        );
      });

      it('should return 503 when all dependencies are unhealthy', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(false);
        mockElasticsearch.healthCheck.mockResolvedValue(false);
        mockRedis.healthCheck.mockResolvedValue(false);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(503);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'not ready',
            checks: {
              database: false,
              elasticsearch: false,
              redis: false,
            },
          })
        );
      });
    });

    describe('error handling', () => {
      it('should handle database health check throwing an error', async () => {
        // Setup
        mockDatabase.healthCheck.mockRejectedValue(new Error('Connection timeout'));
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute & Assert
        await expect(
          controller.readiness(mockRequest as Request, mockResponse as Response)
        ).rejects.toThrow('Connection timeout');
      });

      it('should handle elasticsearch health check throwing an error', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockRejectedValue(new Error('ES unavailable'));
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute & Assert
        await expect(
          controller.readiness(mockRequest as Request, mockResponse as Response)
        ).rejects.toThrow('ES unavailable');
      });

      it('should handle redis health check throwing an error', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockRejectedValue(new Error('Redis connection lost'));

        // Execute & Assert
        await expect(
          controller.readiness(mockRequest as Request, mockResponse as Response)
        ).rejects.toThrow('Redis connection lost');
      });

      it('should handle multiple health checks throwing errors', async () => {
        // Setup
        mockDatabase.healthCheck.mockRejectedValue(new Error('DB error'));
        mockElasticsearch.healthCheck.mockRejectedValue(new Error('ES error'));
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute & Assert - first error encountered should be thrown
        await expect(
          controller.readiness(mockRequest as Request, mockResponse as Response)
        ).rejects.toThrow();
      });
    });

    describe('edge cases', () => {
      it('should call all health checks concurrently', async () => {
        // Setup
        let dbCheckStarted = false;
        let esCheckStarted = false;
        let redisCheckStarted = false;

        mockDatabase.healthCheck.mockImplementation(async () => {
          dbCheckStarted = true;
          await new Promise((resolve) => setTimeout(resolve, 10));
          return true;
        });

        mockElasticsearch.healthCheck.mockImplementation(async () => {
          esCheckStarted = true;
          // Verify other checks have started (concurrent execution)
          expect(dbCheckStarted).toBe(true);
          await new Promise((resolve) => setTimeout(resolve, 10));
          return true;
        });

        mockRedis.healthCheck.mockImplementation(async () => {
          redisCheckStarted = true;
          // Verify other checks have started (concurrent execution)
          expect(dbCheckStarted).toBe(true);
          await new Promise((resolve) => setTimeout(resolve, 10));
          return true;
        });

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert - all checks should have been started
        expect(dbCheckStarted).toBe(true);
        expect(esCheckStarted).toBe(true);
        expect(redisCheckStarted).toBe(true);
      });

      it('should handle concurrent readiness requests', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute - fire multiple requests concurrently
        await Promise.all([
          controller.readiness(mockRequest as Request, mockResponse as Response),
          controller.readiness(mockRequest as Request, mockResponse as Response),
          controller.readiness(mockRequest as Request, mockResponse as Response),
        ]);

        // Assert - all checks should be called for each request (3 requests * 3 checks = 9)
        expect(mockDatabase.healthCheck).toHaveBeenCalledTimes(3);
        expect(mockElasticsearch.healthCheck).toHaveBeenCalledTimes(3);
        expect(mockRedis.healthCheck).toHaveBeenCalledTimes(3);
        expect(mockResponse.status).toHaveBeenCalledTimes(3);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it('should handle transition from healthy to unhealthy state', async () => {
        // Setup - first call healthy
        mockDatabase.healthCheck.mockResolvedValueOnce(true);
        mockElasticsearch.healthCheck.mockResolvedValueOnce(true);
        mockRedis.healthCheck.mockResolvedValueOnce(true);

        // Execute first call
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert first call
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        // Setup - second call unhealthy
        mockDatabase.healthCheck.mockResolvedValueOnce(false);
        mockElasticsearch.healthCheck.mockResolvedValueOnce(true);
        mockRedis.healthCheck.mockResolvedValueOnce(true);

        // Reset mocks for second call
        (mockResponse.status as jest.Mock).mockClear();
        (mockResponse.json as jest.Mock).mockClear();

        // Execute second call
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert second call
        expect(mockResponse.status).toHaveBeenCalledWith(503);
      });

      it('should handle transition from unhealthy to healthy state', async () => {
        // Setup - first call unhealthy
        mockDatabase.healthCheck.mockResolvedValueOnce(false);
        mockElasticsearch.healthCheck.mockResolvedValueOnce(true);
        mockRedis.healthCheck.mockResolvedValueOnce(true);

        // Execute first call
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert first call
        expect(mockResponse.status).toHaveBeenCalledWith(503);

        // Setup - second call healthy
        mockDatabase.healthCheck.mockResolvedValueOnce(true);
        mockElasticsearch.healthCheck.mockResolvedValueOnce(true);
        mockRedis.healthCheck.mockResolvedValueOnce(true);

        // Reset mocks for second call
        (mockResponse.status as jest.Mock).mockClear();
        (mockResponse.json as jest.Mock).mockClear();

        // Execute second call
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert second call
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });
    });

    describe('response structure validation', () => {
      it('should always include all three health check results', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(false);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall.checks).toHaveProperty('database');
        expect(responseCall.checks).toHaveProperty('elasticsearch');
        expect(responseCall.checks).toHaveProperty('redis');
        expect(Object.keys(responseCall.checks)).toHaveLength(3);
      });

      it('should include status field in response', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall).toHaveProperty('status');
        expect(typeof responseCall.status).toBe('string');
      });

      it('should include timestamp field in response', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall).toHaveProperty('timestamp');
        expect(typeof responseCall.timestamp).toBe('string');
      });

      it('should include checks field in response', async () => {
        // Setup
        mockDatabase.healthCheck.mockResolvedValue(true);
        mockElasticsearch.healthCheck.mockResolvedValue(true);
        mockRedis.healthCheck.mockResolvedValue(true);

        // Execute
        await controller.readiness(mockRequest as Request, mockResponse as Response);

        // Assert
        const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(responseCall).toHaveProperty('checks');
        expect(typeof responseCall.checks).toBe('object');
      });
    });
  });

  describe('controller instance', () => {
    it('should be able to create multiple instances', () => {
      // Execute
      const controller1 = new HealthController();
      const controller2 = new HealthController();

      // Assert
      expect(controller1).toBeInstanceOf(HealthController);
      expect(controller2).toBeInstanceOf(HealthController);
      expect(controller1).not.toBe(controller2);
    });

    it('should have all required methods', () => {
      // Assert
      expect(typeof controller.healthCheck).toBe('function');
      expect(typeof controller.liveness).toBe('function');
      expect(typeof controller.readiness).toBe('function');
    });
  });
});
