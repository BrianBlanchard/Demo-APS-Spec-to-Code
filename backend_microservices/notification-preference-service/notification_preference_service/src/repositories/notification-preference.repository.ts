import { Knex } from 'knex';
import { NotificationPreferenceEntity } from '../types/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from '../types/notification-preference.dto';
import { DatabaseError } from '../types/exceptions';
import { logger } from '../utils/logger';

interface DbRow {
  id: string;
  customer_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  transaction_alerts_enabled: boolean;
  transaction_alerts_threshold: string;
  transaction_alerts_channels: string;
  payment_confirmations_enabled: boolean;
  payment_confirmations_channels: string;
  monthly_statements_enabled: boolean;
  monthly_statements_channels: string;
  marketing_emails_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface INotificationPreferenceRepository {
  findByCustomerId(customerId: string): Promise<NotificationPreferenceEntity | null>;
  upsert(
    customerId: string,
    preferences: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceEntity>;
}

export class NotificationPreferenceRepository implements INotificationPreferenceRepository {
  private readonly tableName = 'notification_preferences';

  constructor(private readonly db: Knex) {}

  async findByCustomerId(customerId: string): Promise<NotificationPreferenceEntity | null> {
    try {
      const result = await this.db<DbRow>(this.tableName)
        .where({ customer_id: customerId })
        .first();

      return result ? this.mapFromDb(result) : null;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to find notification preference');
      throw new DatabaseError('Failed to retrieve notification preferences');
    }
  }

  async upsert(
    customerId: string,
    preferences: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceEntity> {
    try {
      const now = new Date();
      const data = {
        customer_id: customerId,
        email_enabled: preferences.emailEnabled,
        sms_enabled: preferences.smsEnabled,
        transaction_alerts_enabled: preferences.transactionAlerts.enabled,
        transaction_alerts_threshold: preferences.transactionAlerts.threshold.toString(),
        transaction_alerts_channels: JSON.stringify(preferences.transactionAlerts.channels),
        payment_confirmations_enabled: preferences.paymentConfirmations.enabled,
        payment_confirmations_channels: JSON.stringify(preferences.paymentConfirmations.channels),
        monthly_statements_enabled: preferences.monthlyStatements.enabled,
        monthly_statements_channels: JSON.stringify(preferences.monthlyStatements.channels),
        marketing_emails_enabled: preferences.marketingEmails.enabled,
        updated_at: now,
      };

      const [result] = await this.db<DbRow>(this.tableName)
        .insert({
          ...data,
          created_at: now,
        })
        .onConflict('customer_id')
        .merge(data)
        .returning('*');

      return this.mapFromDb(result);
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to upsert notification preference');
      throw new DatabaseError('Failed to save notification preferences');
    }
  }

  private mapFromDb(row: DbRow): NotificationPreferenceEntity {
    return {
      id: row.id,
      customerId: row.customer_id,
      emailEnabled: row.email_enabled,
      smsEnabled: row.sms_enabled,
      transactionAlertsEnabled: row.transaction_alerts_enabled,
      transactionAlertsThreshold: parseFloat(row.transaction_alerts_threshold),
      transactionAlertsChannels: JSON.parse(row.transaction_alerts_channels),
      paymentConfirmationsEnabled: row.payment_confirmations_enabled,
      paymentConfirmationsChannels: JSON.parse(row.payment_confirmations_channels),
      monthlyStatementsEnabled: row.monthly_statements_enabled,
      monthlyStatementsChannels: JSON.parse(row.monthly_statements_channels),
      marketingEmailsEnabled: row.marketing_emails_enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
