import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import { Knex } from 'knex';

describe('HealthController', () => {
  let healthController: HealthController;
  let mockDb: jest.Mocked<Knex>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    mockDb = {
      raw: jest.fn(),
    } as unknown as jest.Mocked<Knex>;

    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockRequest = {};
    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    healthController = new HealthController(mockDb);
  });

  describe('liveness', () => {
    it('should return 200 status with UP', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return valid ISO timestamp', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should not check database connectivity', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).not.toHaveBeenCalled();
    });

    it('should always return UP status', async () => {
      mockDb.raw.mockRejectedValue(new Error('Database down'));

      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
        })
      );
    });
  });

  describe('readiness', () => {
    it('should return 200 status with UP when database is healthy', async () => {
      mockDb.raw.mockResolvedValue({} as never);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          timestamp: expect.any(String),
          checks: {
            database: 'UP',
          },
        })
      );
    });

    it('should return 503 status with DOWN when database is unhealthy', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection failed'));

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          timestamp: expect.any(String),
          checks: {
            database: 'DOWN',
          },
        })
      );
    });

    it('should return valid ISO timestamp', async () => {
      mockDb.raw.mockResolvedValue({} as never);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle database timeout errors', async () => {
      mockDb.raw.mockRejectedValue(new Error('Timeout'));

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          checks: {
            database: 'DOWN',
          },
        })
      );
    });
  });

  describe('health', () => {
    it('should return 200 status with healthy when database is up', async () => {
      mockDb.raw.mockResolvedValue({} as never);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          service: 'account-reporting-service',
          version: '1.0.0',
        })
      );
    });

    it('should return 503 status with unhealthy when database is down', async () => {
      mockDb.raw.mockRejectedValue(new Error('Database error'));

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          timestamp: expect.any(String),
          service: 'account-reporting-service',
          version: '1.0.0',
        })
      );
    });

    it('should return valid ISO timestamp', async () => {
      mockDb.raw.mockResolvedValue({} as never);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include service name and version', async () => {
      mockDb.raw.mockResolvedValue({} as never);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'account-reporting-service',
          version: '1.0.0',
        })
      );
    });

    it('should handle various database errors', async () => {
      const errors = [
        new Error('Connection refused'),
        new Error('Too many connections'),
        new Error('Authentication failed'),
      ];

      for (const error of errors) {
        mockDb.raw.mockRejectedValue(error);
        jsonSpy.mockClear();
        statusSpy.mockClear();

        await healthController.health(mockRequest as Request, mockResponse as Response);

        expect(statusSpy).toHaveBeenCalledWith(503);
        expect(jsonSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'unhealthy',
          })
        );
      }
    });
  });
});
