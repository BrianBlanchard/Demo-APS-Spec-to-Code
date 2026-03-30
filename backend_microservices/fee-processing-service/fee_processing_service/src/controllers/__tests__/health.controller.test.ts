import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import { db } from '../../config/database.config';

jest.mock('../../config/database.config', () => ({
  db: {
    raw: jest.fn(),
  },
}));

describe('HealthController', () => {
  let healthController: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    healthController = new HealthController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('ready', () => {
    it('should return 200 when database is connected', async () => {
      (db.raw as jest.Mock).mockResolvedValue(null);

      await healthController.ready(mockRequest as Request, mockResponse as Response);

      expect(db.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'fee-processing-service',
          version: '1.0.0',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return 503 when database is not connected', async () => {
      (db.raw as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

      await healthController.ready(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          service: 'fee-processing-service',
          version: '1.0.0',
        })
      );
    });
  });

  describe('live', () => {
    it('should return 200 for liveness check', async () => {
      await healthController.live(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'fee-processing-service',
          version: '1.0.0',
          timestamp: expect.any(String),
        })
      );
    });
  });
});
