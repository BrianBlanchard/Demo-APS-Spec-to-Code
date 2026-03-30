import { Request, Response } from 'express';
import { HealthController } from '../../src/controllers/health.controller';
import * as databaseConfig from '../../src/config/database.config';

jest.mock('../../src/config/database.config');

describe('HealthController', () => {
  let healthController: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    healthController = new HealthController();

    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('readiness', () => {
    it('should return 200 when database is connected', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue({}),
      };
      jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb as any);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          checks: {
            database: 'ok',
          },
        })
      );
    });

    it('should return 503 when database connection fails', async () => {
      const mockDb = {
        raw: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb as any);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          checks: {
            database: 'error',
          },
        })
      );
    });

    it('should include timestamp in response', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue({}),
      };
      jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb as any);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should include uptime in response', async () => {
      const mockDb = {
        raw: jest.fn().mockResolvedValue({}),
      };
      jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb as any);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          uptime: expect.any(Number),
        })
      );
    });
  });

  describe('liveness', () => {
    it('should return 200 with ok status', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
        })
      );
    });

    it('should include timestamp in response', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should include uptime in response', async () => {
      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          uptime: expect.any(Number),
        })
      );
    });

    it('should not check database connection', async () => {
      const mockDb = {
        raw: jest.fn(),
      };
      jest.spyOn(databaseConfig, 'getDatabase').mockReturnValue(mockDb as any);

      await healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).not.toHaveBeenCalled();
    });
  });
});
