import { Request, Response, NextFunction } from 'express';
import { SmsNotificationController } from '../sms-notification.controller';
import { ISmsNotificationService } from '../../services/sms-notification.service';
import { SendSmsRequest, SendSmsResponse } from '../../dtos/sms.dto';
import { MessageType, Priority, SmsStatus } from '../../types/enums';
import { ValidationError, CustomerOptedOutError, SmsDeliveryError } from '../../types/errors';

describe('SmsNotificationController', () => {
  let controller: SmsNotificationController;
  let mockService: jest.Mocked<ISmsNotificationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = {
      sendSms: jest.fn(),
    };

    controller = new SmsNotificationController(mockService);

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('sendSms', () => {
    describe('successful SMS sending', () => {
      it('should send SMS and return 200 with response', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.FRAUD_ALERT,
          message: 'ALERT: Large transaction detected',
          priority: Priority.CRITICAL,
        };

        const response: SendSmsResponse = {
          notificationId: 'SMS-20240115-ABC456',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:30:02Z',
          messageId: 'SM1234567890abcdef',
        };

        mockRequest.body = request;
        mockService.sendSms.mockResolvedValue(response);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(request);
        expect(mockService.sendSms).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(response);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle OTP message type', async () => {
        const request: SendSmsRequest = {
          to: '+14155552345',
          messageType: MessageType.OTP,
          message: 'Your verification code is 123456',
          priority: Priority.HIGH,
        };

        const response: SendSmsResponse = {
          notificationId: 'SMS-20240115-XYZ789',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:31:00Z',
          messageId: 'SM0987654321fedcba',
        };

        mockRequest.body = request;
        mockService.sendSms.mockResolvedValue(response);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(request);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(response);
      });

      it('should handle transaction confirmation message type', async () => {
        const request: SendSmsRequest = {
          to: '+12025559876',
          messageType: MessageType.TRANSACTION_CONFIRMATION,
          message: 'Transaction of $500.00 approved',
          priority: Priority.MEDIUM,
        };

        const response: SendSmsResponse = {
          notificationId: 'SMS-20240115-DEF123',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:32:00Z',
          messageId: 'SM1111222233334444',
        };

        mockRequest.body = request;
        mockService.sendSms.mockResolvedValue(response);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(request);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it('should handle account status message type', async () => {
        const request: SendSmsRequest = {
          to: '+15105553210',
          messageType: MessageType.ACCOUNT_STATUS,
          message: 'Your account has been verified',
          priority: Priority.LOW,
        };

        const response: SendSmsResponse = {
          notificationId: 'SMS-20240115-GHI456',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:33:00Z',
          messageId: 'SM5555666677778888',
        };

        mockRequest.body = request;
        mockService.sendSms.mockResolvedValue(response);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(request);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });
    });

    describe('error handling', () => {
      it('should pass ValidationError to next middleware', async () => {
        const request: SendSmsRequest = {
          to: 'invalid-phone',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        const error = new ValidationError('Invalid phone number format');

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue(error);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(request);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should pass CustomerOptedOutError to next middleware', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.FRAUD_ALERT,
          message: 'Test',
          priority: Priority.CRITICAL,
        };

        const error = new CustomerOptedOutError('Customer has opted out');

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue(error);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('should pass SmsDeliveryError to next middleware', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        const error = new SmsDeliveryError('Failed to deliver SMS');

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue(error);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('should pass generic errors to next middleware', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        const error = new Error('Unexpected error');

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue(error);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockNext).toHaveBeenCalledTimes(1);
      });

      it('should handle service throwing non-Error objects', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue('string error');

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith('string error');
      });
    });

    describe('request body handling', () => {
      it('should correctly extract request body', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test message',
          priority: Priority.HIGH,
        };

        mockRequest.body = { ...request, extraField: 'should be ignored' };

        mockService.sendSms.mockResolvedValue({
          notificationId: 'SMS-20240115-TEST',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:30:00Z',
          messageId: 'SM123',
        });

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledWith(mockRequest.body);
      });

      it('should handle empty request body', async () => {
        mockRequest.body = {};

        mockService.sendSms.mockRejectedValue(new ValidationError('Missing required fields'));

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('service interaction', () => {
      it('should call service exactly once per request', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        mockRequest.body = request;
        mockService.sendSms.mockResolvedValue({
          notificationId: 'SMS-20240115-TEST',
          status: SmsStatus.SENT,
          sentAt: '2024-01-15T14:30:00Z',
          messageId: 'SM123',
        });

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockService.sendSms).toHaveBeenCalledTimes(1);
      });

      it('should not swallow service errors', async () => {
        const request: SendSmsRequest = {
          to: '+13125550123',
          messageType: MessageType.OTP,
          message: 'Test',
          priority: Priority.HIGH,
        };

        const error = new Error('Service error');

        mockRequest.body = request;
        mockService.sendSms.mockRejectedValue(error);

        await controller.sendSms(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });
});
