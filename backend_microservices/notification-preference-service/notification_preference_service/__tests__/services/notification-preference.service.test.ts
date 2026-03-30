import { NotificationPreferenceService } from '../../src/services/notification-preference.service';
import { INotificationPreferenceRepository } from '../../src/repositories/notification-preference.repository';
import { IAuditService } from '../../src/services/audit.service';
import { UpdateNotificationPreferenceDto } from '../../src/types/notification-preference.dto';
import { NotificationPreferenceEntity } from '../../src/types/notification-preference.entity';
import { ValidationError } from '../../src/types/exceptions';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let mockRepository: jest.Mocked<INotificationPreferenceRepository>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockRepository = {
      findByCustomerId: jest.fn(),
      upsert: jest.fn(),
    };

    mockAuditService = {
      log: jest.fn(),
    };

    service = new NotificationPreferenceService(mockRepository, mockAuditService);
  });

  describe('updatePreferences', () => {
    const validDto: UpdateNotificationPreferenceDto = {
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

    const mockEntity: NotificationPreferenceEntity = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      customerId: 'CUST123',
      emailEnabled: true,
      smsEnabled: true,
      transactionAlertsEnabled: true,
      transactionAlertsThreshold: 500.0,
      transactionAlertsChannels: ['email', 'sms'],
      paymentConfirmationsEnabled: true,
      paymentConfirmationsChannels: ['email'],
      monthlyStatementsEnabled: true,
      monthlyStatementsChannels: ['email'],
      marketingEmailsEnabled: false,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T14:30:00Z'),
    };

    it('should update preferences successfully', async () => {
      mockRepository.upsert.mockResolvedValue(mockEntity);

      const result = await service.updatePreferences('CUST123', validDto);

      expect(mockRepository.upsert).toHaveBeenCalledWith('CUST123', validDto);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'UPDATE_NOTIFICATION_PREFERENCES',
        'CUST123',
        'SUCCESS'
      );
      expect(result.customerId).toBe('CUST123');
      expect(result.preferences.emailEnabled).toBe(true);
      expect(result.preferences.smsEnabled).toBe(true);
      expect(result.updatedAt).toBe('2024-01-15T14:30:00.000Z');
    });

    it('should map entity to response correctly', async () => {
      mockRepository.upsert.mockResolvedValue(mockEntity);

      const result = await service.updatePreferences('CUST123', validDto);

      expect(result.preferences.transactionAlerts).toEqual({
        enabled: true,
        threshold: 500.0,
        channels: ['email', 'sms'],
      });
      expect(result.preferences.paymentConfirmations).toEqual({
        enabled: true,
        channels: ['email'],
      });
      expect(result.preferences.monthlyStatements).toEqual({
        enabled: true,
        channels: ['email'],
      });
      expect(result.preferences.marketingEmails).toEqual({
        enabled: false,
      });
    });

    it('should handle all notifications disabled', async () => {
      const allDisabledDto: UpdateNotificationPreferenceDto = {
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

      const allDisabledEntity: NotificationPreferenceEntity = {
        ...mockEntity,
        emailEnabled: false,
        smsEnabled: false,
        transactionAlertsEnabled: false,
        transactionAlertsThreshold: 0,
        paymentConfirmationsEnabled: false,
        monthlyStatementsEnabled: false,
        marketingEmailsEnabled: false,
      };

      mockRepository.upsert.mockResolvedValue(allDisabledEntity);

      const result = await service.updatePreferences('CUST123', allDisabledDto);

      expect(result.preferences.emailEnabled).toBe(false);
      expect(result.preferences.smsEnabled).toBe(false);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should reject negative threshold', async () => {
      const invalidDto: UpdateNotificationPreferenceDto = {
        ...validDto,
        transactionAlerts: {
          enabled: true,
          threshold: -100,
          channels: ['email'],
        },
      };

      await expect(service.updatePreferences('CUST123', invalidDto)).rejects.toThrow(
        ValidationError
      );
      await expect(service.updatePreferences('CUST123', invalidDto)).rejects.toThrow(
        'Transaction alert threshold must be non-negative'
      );

      expect(mockRepository.upsert).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });

    it('should accept zero threshold', async () => {
      const zeroThresholdDto: UpdateNotificationPreferenceDto = {
        ...validDto,
        transactionAlerts: {
          enabled: true,
          threshold: 0,
          channels: ['email'],
        },
      };

      const zeroThresholdEntity: NotificationPreferenceEntity = {
        ...mockEntity,
        transactionAlertsThreshold: 0,
      };

      mockRepository.upsert.mockResolvedValue(zeroThresholdEntity);

      const result = await service.updatePreferences('CUST123', zeroThresholdDto);

      expect(result.preferences.transactionAlerts.threshold).toBe(0);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should handle multiple channels', async () => {
      const multiChannelDto: UpdateNotificationPreferenceDto = {
        ...validDto,
        transactionAlerts: {
          enabled: true,
          threshold: 500.0,
          channels: ['email', 'sms', 'push'],
        },
      };

      const multiChannelEntity: NotificationPreferenceEntity = {
        ...mockEntity,
        transactionAlertsChannels: ['email', 'sms', 'push'],
      };

      mockRepository.upsert.mockResolvedValue(multiChannelEntity);

      const result = await service.updatePreferences('CUST123', multiChannelDto);

      expect(result.preferences.transactionAlerts.channels).toEqual(['email', 'sms', 'push']);
    });

    it('should handle large threshold values', async () => {
      const largeThresholdDto: UpdateNotificationPreferenceDto = {
        ...validDto,
        transactionAlerts: {
          enabled: true,
          threshold: 999999.99,
          channels: ['email'],
        },
      };

      const largeThresholdEntity: NotificationPreferenceEntity = {
        ...mockEntity,
        transactionAlertsThreshold: 999999.99,
      };

      mockRepository.upsert.mockResolvedValue(largeThresholdEntity);

      const result = await service.updatePreferences('CUST123', largeThresholdDto);

      expect(result.preferences.transactionAlerts.threshold).toBe(999999.99);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.upsert.mockRejectedValue(error);

      await expect(service.updatePreferences('CUST123', validDto)).rejects.toThrow(error);

      expect(mockAuditService.log).not.toHaveBeenCalled();
    });

    it('should format updatedAt as ISO string', async () => {
      mockRepository.upsert.mockResolvedValue(mockEntity);

      const result = await service.updatePreferences('CUST123', validDto);

      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it('should handle different customer IDs', async () => {
      const customerId = 'DIFFERENT_CUSTOMER_456';
      const differentEntity = { ...mockEntity, customerId };
      mockRepository.upsert.mockResolvedValue(differentEntity);

      const result = await service.updatePreferences(customerId, validDto);

      expect(mockRepository.upsert).toHaveBeenCalledWith(customerId, validDto);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'UPDATE_NOTIFICATION_PREFERENCES',
        customerId,
        'SUCCESS'
      );
      expect(result.customerId).toBe(customerId);
    });

    it('should call audit service after successful update', async () => {
      mockRepository.upsert.mockResolvedValue(mockEntity);

      await service.updatePreferences('CUST123', validDto);

      expect(mockAuditService.log).toHaveBeenCalledTimes(1);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'UPDATE_NOTIFICATION_PREFERENCES',
        'CUST123',
        'SUCCESS'
      );
    });

    it('should not call audit service if repository fails', async () => {
      mockRepository.upsert.mockRejectedValue(new Error('DB error'));

      await expect(service.updatePreferences('CUST123', validDto)).rejects.toThrow();

      expect(mockAuditService.log).not.toHaveBeenCalled();
    });

    it('should not call audit service if validation fails', async () => {
      const invalidDto: UpdateNotificationPreferenceDto = {
        ...validDto,
        transactionAlerts: {
          enabled: true,
          threshold: -100,
          channels: ['email'],
        },
      };

      await expect(service.updatePreferences('CUST123', invalidDto)).rejects.toThrow();

      expect(mockRepository.upsert).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });
  });
});
