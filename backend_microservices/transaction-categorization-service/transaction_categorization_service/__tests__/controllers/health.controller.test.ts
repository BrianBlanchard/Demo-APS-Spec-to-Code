import { Request, Response } from 'express';
import { HealthController } from '../../src/controllers/health.controller';
import type { ITransactionCategoryRepository } from '../../src/repositories/transaction-category.repository';

describe('HealthController', () => {
  let healthController: HealthController;
  let mockRepository: ITransactionCategoryRepository;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findByMcc: jest.fn(),
      checkDatabaseHealth: jest.fn(),
    };

    // Create mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    healthController = new HealthController(mockRepository);
  });

  describe('checkHealth', () => {
    it('should return UP status when database is healthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          database: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should return DOWN status when database is unhealthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(false);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          database: 'DOWN',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should return valid ISO timestamp', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return positive uptime', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.uptime).toBeGreaterThan(0);
    });

    it('should include database field in response', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.database).toBeDefined();
      expect(['UP', 'DOWN']).toContain(callArgs.database);
    });
  });

  describe('checkLiveness', () => {
    it('should always return UP status', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should not check database health', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).not.toHaveBeenCalled();
    });

    it('should not include database field in response', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.database).toBeUndefined();
    });

    it('should return valid ISO timestamp', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return positive uptime', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.uptime).toBeGreaterThan(0);
    });

    it('should return UP even if called multiple times', async () => {
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);
      await healthController.checkLiveness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledTimes(3);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('checkReadiness', () => {
    it('should return UP status when database is healthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UP',
          database: 'UP',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should return DOWN status when database is unhealthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(false);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'DOWN',
          database: 'DOWN',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });

    it('should return valid ISO timestamp', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return positive uptime', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.uptime).toBeGreaterThan(0);
    });

    it('should include database field in response', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.database).toBeDefined();
      expect(['UP', 'DOWN']).toContain(callArgs.database);
    });

    it('should check database health on each call', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);
      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);

      expect(mockRepository.checkDatabaseHealth).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    it('should handle database health check errors in checkHealth', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(
        healthController.checkHealth(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Database connection error');
    });

    it('should handle database health check errors in checkReadiness', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(
        healthController.checkReadiness(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('Response consistency', () => {
    it('should return same status for checkHealth and checkReadiness when database is healthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(true);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);
      const healthResponse = jsonMock.mock.calls[0][0];

      jsonMock.mockClear();
      statusMock.mockClear();

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);
      const readinessResponse = jsonMock.mock.calls[0][0];

      expect(healthResponse.status).toBe(readinessResponse.status);
      expect(healthResponse.database).toBe(readinessResponse.database);
    });

    it('should return same status for checkHealth and checkReadiness when database is unhealthy', async () => {
      (mockRepository.checkDatabaseHealth as jest.Mock).mockResolvedValue(false);

      await healthController.checkHealth(mockRequest as Request, mockResponse as Response);
      const healthResponse = jsonMock.mock.calls[0][0];

      jsonMock.mockClear();
      statusMock.mockClear();

      await healthController.checkReadiness(mockRequest as Request, mockResponse as Response);
      const readinessResponse = jsonMock.mock.calls[0][0];

      expect(healthResponse.status).toBe(readinessResponse.status);
      expect(healthResponse.database).toBe(readinessResponse.database);
    });
  });
});
