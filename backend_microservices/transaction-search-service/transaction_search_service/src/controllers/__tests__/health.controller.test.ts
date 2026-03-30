import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import { Knex } from 'knex';

describe('HealthController - Controller/API Layer', () => {
  let controller: HealthController;
  let mockDb: jest.Mocked<Knex>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockDb = {
      raw: jest.fn(),
    } as unknown as jest.Mocked<Knex>;

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    controller = new HealthController(mockDb);
  });

  describe('readiness', () => {
    it('should return 200 when database is healthy', async () => {
      mockDb.raw.mockResolvedValue({} as any);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
          checks: {
            database: 'healthy',
          },
        })
      );
    });

    it('should return 503 when database is unhealthy', async () => {
      mockDb.raw.mockRejectedValue(new Error('Database connection failed'));

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'not ready',
          checks: {
            database: 'unhealthy',
          },
        })
      );
    });

    it('should include timestamp in readiness response', async () => {
      mockDb.raw.mockResolvedValue({} as any);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(new Date(callArgs.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('liveness', () => {
    it('should always return 200', () => {
      controller.liveness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'alive',
        })
      );
    });

    it('should include timestamp in liveness response', () => {
      controller.liveness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(new Date(callArgs.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('health', () => {
    it('should return health status with service info', () => {
      controller.health(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'transaction-search-service',
          version: '1.0.0',
        })
      );
    });

    it('should include timestamp in health response', () => {
      controller.health(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(new Date(callArgs.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});
