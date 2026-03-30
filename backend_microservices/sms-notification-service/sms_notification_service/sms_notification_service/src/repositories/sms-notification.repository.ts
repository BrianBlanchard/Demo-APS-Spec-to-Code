import { Knex } from 'knex';
import { SmsNotification } from '../dtos/sms.dto';
import { SmsStatus } from '../types/enums';

export interface ISmsNotificationRepository {
  create(notification: Omit<SmsNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmsNotification>;
  updateStatus(
    notificationId: string,
    status: SmsStatus,
    messageId: string | null,
    failureReason: string | null
  ): Promise<void>;
  incrementRetryCount(notificationId: string): Promise<void>;
  findByNotificationId(notificationId: string): Promise<SmsNotification | null>;
}

export class SmsNotificationRepository implements ISmsNotificationRepository {
  private readonly tableName = 'sms_notifications';

  constructor(private readonly db: Knex) {}

  async create(
    notification: Omit<SmsNotification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SmsNotification> {
    const [created] = await this.db(this.tableName)
      .insert({
        notification_id: notification.notificationId,
        to: notification.to,
        message_type: notification.messageType,
        message: notification.message,
        priority: notification.priority,
        status: notification.status,
        message_id: notification.messageId,
        sent_at: notification.sentAt,
        failure_reason: notification.failureReason,
        retry_count: notification.retryCount,
      })
      .returning('*');

    return this.mapToModel(created);
  }

  async updateStatus(
    notificationId: string,
    status: SmsStatus,
    messageId: string | null,
    failureReason: string | null
  ): Promise<void> {
    await this.db(this.tableName)
      .where({ notification_id: notificationId })
      .update({
        status,
        message_id: messageId,
        failure_reason: failureReason,
        sent_at: status === SmsStatus.SENT ? new Date() : null,
        updated_at: new Date(),
      });
  }

  async incrementRetryCount(notificationId: string): Promise<void> {
    await this.db(this.tableName)
      .where({ notification_id: notificationId })
      .increment('retry_count', 1)
      .update({ updated_at: new Date() });
  }

  async findByNotificationId(notificationId: string): Promise<SmsNotification | null> {
    const record = await this.db(this.tableName)
      .where({ notification_id: notificationId })
      .first();

    return record ? this.mapToModel(record) : null;
  }

  private mapToModel(row: any): SmsNotification {
    return {
      id: row.id,
      notificationId: row.notification_id,
      to: row.to,
      messageType: row.message_type,
      message: row.message,
      priority: row.priority,
      status: row.status,
      messageId: row.message_id,
      sentAt: row.sent_at,
      failureReason: row.failure_reason,
      retryCount: row.retry_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
