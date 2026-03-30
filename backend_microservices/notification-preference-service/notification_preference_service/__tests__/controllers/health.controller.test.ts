import { Request, Response } from 'express';
import { Knex } from 'knex';
import { HealthController } from '../../src/controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDb: jest.Mocked<Knex>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockDb = {
      raw: jest.fn(),
    } as any;

    controller = new HealthController(mockDb);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('ready', () => {
    it('should return UP status when database is accessible', async () => {
      mockDb.raw.mockResolvedValue({});

      await controller.ready(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          checks: {
            database: 'UP',
          },
        })
      );
    });

    it('should include timestamp in response', async () => {
      mockDb.raw.mockResolvedValue({});

      await controller.ready(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should return DOWN status when database is not accessible', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection failed'));

      await controller.ready(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          checks: {
            database: 'DOWN',
          },
        })
      );
    });

    it('should handle database timeout errors', async () => {
      mockDb.raw.mockRejectedValue(new Error('Timeout'));

      await controller.ready(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          checks: {
            database: 'DOWN',
          },
        })
      );
    });

    it('should handle database connection errors', async () => {
      mockDb.raw.mockRejectedValue(new Error('ECONNREFUSED'));

      await controller.ready(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
    });

    it('should format timestamp as ISO string', async () => {
      mockDb.raw.mockResolvedValue({});

      await controller.ready(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  describe('live', () => {
    it('should always return UP status', async () => {
      await controller.live(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          checks: {
            database: 'UP',
          },
        })
      );
    });

    it('should include timestamp', async () => {
      await controller.live(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should not check database connection', async () => {
      await controller.live(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).not.toHaveBeenCalled();
    });

    it('should format timestamp as ISO string', async () => {
      await controller.live(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it('should return 200 status code', async () => {
      await controller.live(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
