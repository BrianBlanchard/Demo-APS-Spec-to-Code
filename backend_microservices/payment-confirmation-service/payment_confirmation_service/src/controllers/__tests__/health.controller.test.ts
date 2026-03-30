import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import { Knex } from 'knex';

describe('Health Controller', () => {
  let healthController: HealthController;
  let mockDb: jest.Mocked<Knex>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockDb = {
      raw: jest.fn(),
    } as any;

    healthController = new HealthController(mockDb);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('healthLive', () => {
    it('should return 200 OK status', async () => {
      await healthController.healthLive(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          timestamp: expect.any(String),
        })
      );
    });

    it('should include timestamp in ISO 8601 format', async () => {
      await healthController.healthLive(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should always return UP status', async () => {
      await healthController.healthLive(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
        })
      );
    });

    it('should not check database connection', async () => {
      await healthController.healthLive(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).not.toHaveBeenCalled();
    });
  });

  describe('healthReady', () => {
    it('should return 200 OK when database is connected', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthReady(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          database: 'UP',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return 503 when database is not connected', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection refused'));

      await healthController.healthReady(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          database: 'DOWN',
          timestamp: expect.any(String),
        })
      );
    });

    it('should include timestamp in ISO 8601 format', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthReady(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle database timeout', async () => {
      mockDb.raw.mockRejectedValue(new Error('Query timeout'));

      await healthController.healthReady(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          database: 'DOWN',
        })
      );
    });

    it('should handle database authentication failure', async () => {
      mockDb.raw.mockRejectedValue(new Error('Authentication failed'));

      await healthController.healthReady(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          database: 'DOWN',
        })
      );
    });
  });

  describe('healthV1', () => {
    it('should return 200 OK with service info when database is connected', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthV1(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          service: 'payment-confirmation',
          version: '1.0.0',
          database: 'UP',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return 503 with service info when database is not connected', async () => {
      mockDb.raw.mockRejectedValue(new Error('Connection refused'));

      await healthController.healthV1(mockRequest as Request, mockResponse as Response);

      expect(mockDb.raw).toHaveBeenCalledWith('SELECT 1');
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          service: 'payment-confirmation',
          version: '1.0.0',
          database: 'DOWN',
          timestamp: expect.any(String),
        })
      );
    });

    it('should include service name', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthV1(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'payment-confirmation',
        })
      );
    });

    it('should include version number', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthV1(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '1.0.0',
        })
      );
    });

    it('should include timestamp in ISO 8601 format', async () => {
      mockDb.raw.mockResolvedValue(undefined);

      await healthController.healthV1(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
