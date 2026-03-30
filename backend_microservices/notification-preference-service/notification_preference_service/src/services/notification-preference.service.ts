import { INotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { IAuditService } from './audit.service';
import {
  UpdateNotificationPreferenceDto,
  NotificationPreferenceResponseDto,
} from '../types/notification-preference.dto';
import { NotificationPreferenceEntity } from '../types/notification-preference.entity';
import { ValidationError } from '../types/exceptions';

export interface INotificationPreferenceService {
  updatePreferences(
    customerId: string,
    preferences: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceResponseDto>;
}

export class NotificationPreferenceService implements INotificationPreferenceService {
  constructor(
    private readonly repository: INotificationPreferenceRepository,
    private readonly auditService: IAuditService
  ) {}

  async updatePreferences(
    customerId: string,
    preferences: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceResponseDto> {
    // Business validation: SMS enabled but no phone validation can be added here
    this.validateBusinessRules(preferences);

    const entity = await this.repository.upsert(customerId, preferences);

    this.auditService.log('UPDATE_NOTIFICATION_PREFERENCES', customerId, 'SUCCESS');

    return this.mapToResponse(entity);
  }

  private validateBusinessRules(preferences: UpdateNotificationPreferenceDto): void {
    // Check if all notifications are disabled (allow but could add warning in real system)
    const allDisabled =
      !preferences.emailEnabled &&
      !preferences.smsEnabled &&
      !preferences.transactionAlerts.enabled &&
      !preferences.paymentConfirmations.enabled &&
      !preferences.monthlyStatements.enabled &&
      !preferences.marketingEmails.enabled;

    if (allDisabled) {
      // In production, might want to return a warning but still allow
      // For now, we accept it per the edge case specification
    }

    // Validate threshold is non-negative (already validated by Zod schema, but double-check)
    if (preferences.transactionAlerts.threshold < 0) {
      throw new ValidationError('Transaction alert threshold must be non-negative');
    }
  }

  private mapToResponse(entity: NotificationPreferenceEntity): NotificationPreferenceResponseDto {
    return {
      customerId: entity.customerId,
      preferences: {
        emailEnabled: entity.emailEnabled,
        smsEnabled: entity.smsEnabled,
        transactionAlerts: {
          enabled: entity.transactionAlertsEnabled,
          threshold: entity.transactionAlertsThreshold,
          channels: entity.transactionAlertsChannels,
        },
        paymentConfirmations: {
          enabled: entity.paymentConfirmationsEnabled,
          channels: entity.paymentConfirmationsChannels,
        },
        monthlyStatements: {
          enabled: entity.monthlyStatementsEnabled,
          channels: entity.monthlyStatementsChannels,
        },
        marketingEmails: {
          enabled: entity.marketingEmailsEnabled,
        },
      },
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
