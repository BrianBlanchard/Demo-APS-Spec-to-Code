import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { HealthController } from '../health.controller';
import * as dbConnection from '../../database/connection';

jest.mock('../../database/connection');

describe('HealthController', () => {
  let controller: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCheckDatabaseConnection: jest.MockedFunction<typeof dbConnection.checkDatabaseConnection>;

  beforeEach(() => {
    controller = new HealthController();

    mockRequest = {};

    mockResponse = {
      status: jest.fn<() => Response>().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn<() => Response>() as unknown as (body: unknown) => Response,
    };

    mockCheckDatabaseConnection = dbConnection.checkDatabaseConnection as jest.MockedFunction<
      typeof dbConnection.checkDatabaseConnection
    >;

    // Reset mock state
    mockCheckDatabaseConnection.mockReset();
  });

  describe('readiness', () => {
    it('should return healthy status when database is connected', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(true);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockCheckDatabaseConnection).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          database: { connected: true },
        })
      );
    });

    it('should return unhealthy status when database is disconnected', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(false);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockCheckDatabaseConnection).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          database: { connected: false },
        })
      );
    });

    it('should include timestamp in response', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(true);
      const beforeCall = new Date();

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      const afterCall = new Date();
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;

      expect(jsonCall.timestamp).toBeDefined();
      const responseTime = new Date(jsonCall.timestamp as string);
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should include uptime in response', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(true);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(jsonCall.uptime).toBeDefined();
      expect(typeof jsonCall.uptime).toBe('number');
      expect(jsonCall.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should check database connection for each request', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(true);

      await controller.readiness(mockRequest as Request, mockResponse as Response);
      await controller.readiness(mockRequest as Request, mockResponse as Response);

      expect(mockCheckDatabaseConnection).toHaveBeenCalledTimes(2);
    });
  });

  describe('liveness', () => {
    it('should always return healthy status', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
        })
      );
    });

    it('should not check database connection', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      expect(mockCheckDatabaseConnection).not.toHaveBeenCalled();
    });

    it('should include timestamp in response', async () => {
      const beforeCall = new Date();

      await controller.liveness(mockRequest as Request, mockResponse as Response);

      const afterCall = new Date();
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;

      expect(jsonCall.timestamp).toBeDefined();
      const responseTime = new Date(jsonCall.timestamp as string);
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should include uptime in response', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(jsonCall.uptime).toBeDefined();
      expect(typeof jsonCall.uptime).toBe('number');
      expect(jsonCall.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should always return database connected as true', async () => {
      await controller.liveness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect((jsonCall.database as Record<string, unknown>).connected).toBe(true);
    });

    it('should respond quickly without database check', async () => {
      const start = Date.now();

      await controller.liveness(mockRequest as Request, mockResponse as Response);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('response format', () => {
    it('should match health response schema structure', async () => {
      mockCheckDatabaseConnection.mockResolvedValue(true);

      await controller.readiness(mockRequest as Request, mockResponse as Response);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0] as Record<string, unknown>;
      expect(jsonCall).toHaveProperty('status');
      expect(jsonCall).toHaveProperty('timestamp');
      expect(jsonCall).toHaveProperty('uptime');
      expect(jsonCall).toHaveProperty('database');
      expect(jsonCall.database).toHaveProperty('connected');
    });
  });
});
