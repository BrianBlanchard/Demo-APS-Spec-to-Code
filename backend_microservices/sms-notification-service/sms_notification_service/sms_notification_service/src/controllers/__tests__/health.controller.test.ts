import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import * as database from '../../config/database';

jest.mock('../../config/database');

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockGetDatabase: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new HealthController();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockGetDatabase = jest.spyOn(database, 'getDatabase');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('liveness', () => {
    it('should return 200 with UP status', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'UP',
        timestamp: expect.any(String),
        service: 'sms-notification-service',
      });
    });

    it('should return ISO8601 timestamp', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return different timestamps on subsequent calls', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);
      const timestamp1 = (mockResponse.json as jest.Mock).mock.calls[0][0].timestamp;

      await new Promise((resolve) => setTimeout(resolve, 2));

      mockResponse.json = jest.fn().mockReturnThis();
      await controller.liveness(mockRequest as Request, mockResponse as Response);
      const timestamp2 = (mockResponse.json as jest.Mock).mock.calls[0][0].timestamp;

      expect(timestamp1).not.toBe(timestamp2);
    });

    it('should always return status UP', async () => {
      for (let i = 0; i < 5; i++) {
        mockResponse.json = jest.fn().mockReturnThis();
        await controller.liveness(mockRequest as Request, mockResponse as Response);

        const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall.status).toBe('UP');
      }
    });

    it('should not check database', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockGetDatabase).not.toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('should return 200 with READY status when database is connected', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue([{ result: 1 }]),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockGetDatabase).toHaveBeenCalled();
      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'READY',
        timestamp: expect.any(String),
        service: 'sms-notification-service',
        checks: {
          database: 'UP',
        },
      });
    });

    it('should return 503 with NOT_READY status when database is down', async () => {
      const mockDb = {
        raw: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockGetDatabase).toHaveBeenCalled();
      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'NOT_READY',
        timestamp: expect.any(String),
        service: 'sms-notification-service',
        checks: {
          database: 'DOWN',
        },
      });
    });

    it('should return ISO8601 timestamp', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue([{ result: 1 }]),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle database timeout', async () => {
      const mockDb = {
        raw: jest.fn().mockRejectedValue(new Error('Query timeout')),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.status).toBe('NOT_READY');
      expect(jsonCall.checks.database).toBe('DOWN');
    });

    it('should handle database connection errors', async () => {
      const mockDb = {
        raw: jest.fn().mockRejectedValue(new Error('Connection refused')),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
    });

    it('should execute database check on every call', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue([{ result: 1 }]),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.readiness(mockRequest as Request, mockResponse as Response);
      await controller.readiness(mockRequest as Request, mockResponse as Response);
      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledTimes(3);
    });
  });

  describe('health', () => {
    it('should return 200 with healthy status', async () => {
      await controller.health(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'sms-notification-service',
        version: '1.0.0',
      });
    });

    it('should return ISO8601 timestamp', async () => {
      await controller.health(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include version information', async () => {
      await controller.health(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.version).toBe('1.0.0');
    });

    it('should not check database', async () => {
      await controller.health(mockRequest as Request, mockResponse as Response);

      expect(mockGetDatabase).not.toHaveBeenCalled();
    });

    it('should always return status healthy', async () => {
      for (let i = 0; i < 5; i++) {
        mockResponse.json = jest.fn().mockReturnThis();
        await controller.health(mockRequest as Request, mockResponse as Response);

        const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall.status).toBe('healthy');
      }
    });
  });

  describe('response format consistency', () => {
    it('should have consistent service name across all endpoints', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue([{ result: 1 }]),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.liveness(mockRequest as Request, mockResponse as Response);
      const livenessResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      mockResponse.json = jest.fn().mockReturnThis();
      await controller.readiness(mockRequest as Request, mockResponse as Response);
      const readinessResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      mockResponse.json = jest.fn().mockReturnThis();
      await controller.health(mockRequest as Request, mockResponse as Response);
      const healthResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(livenessResponse.service).toBe('sms-notification-service');
      expect(readinessResponse.service).toBe('sms-notification-service');
      expect(healthResponse.service).toBe('sms-notification-service');
    });

    it('should have timestamp in all responses', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue([{ result: 1 }]),
      };
      mockGetDatabase.mockReturnValue(mockDb);

      await controller.liveness(mockRequest as Request, mockResponse as Response);
      const livenessResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      mockResponse.json = jest.fn().mockReturnThis();
      await controller.readiness(mockRequest as Request, mockResponse as Response);
      const readinessResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      mockResponse.json = jest.fn().mockReturnThis();
      await controller.health(mockRequest as Request, mockResponse as Response);
      const healthResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(livenessResponse.timestamp).toBeDefined();
      expect(readinessResponse.timestamp).toBeDefined();
      expect(healthResponse.timestamp).toBeDefined();
    });
  });
});
