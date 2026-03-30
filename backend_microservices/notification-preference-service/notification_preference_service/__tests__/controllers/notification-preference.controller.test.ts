import { Request, Response, NextFunction } from 'express';
import { NotificationPreferenceController } from '../../src/controllers/notification-preference.controller';
import { INotificationPreferenceService } from '../../src/services/notification-preference.service';
import { UpdateNotificationPreferenceDto, NotificationPreferenceResponseDto } from '../../src/types/notification-preference.dto';

describe('NotificationPreferenceController', () => {
  let controller: NotificationPreferenceController;
  let mockService: jest.Mocked<INotificationPreferenceService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      updatePreferences: jest.fn(),
    };

    controller = new NotificationPreferenceController(mockService);

    mockRequest = {
      params: { customerId: 'CUST123' },
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const requestDto: UpdateNotificationPreferenceDto = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email', 'sms'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const expectedResponse: NotificationPreferenceResponseDto = {
        customerId: 'CUST123',
        preferences: requestDto,
        updatedAt: '2024-01-15T14:30:00Z',
      };

      mockRequest.body = requestDto;
      mockService.updatePreferences.mockResolvedValue(expectedResponse);

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.updatePreferences).toHaveBeenCalledWith('CUST123', requestDto);
      expect(mockService.updatePreferences).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors by calling next', async () => {
      const requestDto: UpdateNotificationPreferenceDto = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const error = new Error('Service error');
      mockRequest.body = requestDto;
      mockService.updatePreferences.mockRejectedValue(error);

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.updatePreferences).toHaveBeenCalledWith('CUST123', requestDto);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should pass customerId from params', async () => {
      const customerId = 'CUSTOMER_456';
      mockRequest.params = { customerId };
      mockRequest.body = {
        emailEnabled: true,
        smsEnabled: false,
        transactionAlerts: {
          enabled: false,
          threshold: 0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: false,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      mockService.updatePreferences.mockResolvedValue({
        customerId,
        preferences: mockRequest.body,
        updatedAt: '2024-01-15T14:30:00Z',
      });

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockService.updatePreferences).toHaveBeenCalledWith(customerId, mockRequest.body);
    });

    it('should handle all notifications disabled', async () => {
      const requestDto: UpdateNotificationPreferenceDto = {
        emailEnabled: false,
        smsEnabled: false,
        transactionAlerts: {
          enabled: false,
          threshold: 0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: false,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: false,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const expectedResponse: NotificationPreferenceResponseDto = {
        customerId: 'CUST123',
        preferences: requestDto,
        updatedAt: '2024-01-15T14:30:00Z',
      };

      mockRequest.body = requestDto;
      mockService.updatePreferences.mockResolvedValue(expectedResponse);

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle zero threshold', async () => {
      const requestDto: UpdateNotificationPreferenceDto = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 0,
          channels: ['email'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const expectedResponse: NotificationPreferenceResponseDto = {
        customerId: 'CUST123',
        preferences: requestDto,
        updatedAt: '2024-01-15T14:30:00Z',
      };

      mockRequest.body = requestDto;
      mockService.updatePreferences.mockResolvedValue(expectedResponse);

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle multiple channels', async () => {
      const requestDto: UpdateNotificationPreferenceDto = {
        emailEnabled: true,
        smsEnabled: true,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email', 'sms', 'push'],
        },
        paymentConfirmations: {
          enabled: true,
          channels: ['email', 'sms'],
        },
        monthlyStatements: {
          enabled: true,
          channels: ['email', 'push'],
        },
        marketingEmails: {
          enabled: false,
        },
      };

      const expectedResponse: NotificationPreferenceResponseDto = {
        customerId: 'CUST123',
        preferences: requestDto,
        updatedAt: '2024-01-15T14:30:00Z',
      };

      mockRequest.body = requestDto;
      mockService.updatePreferences.mockResolvedValue(expectedResponse);

      await controller.updatePreferences(
        mockRequest as Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
