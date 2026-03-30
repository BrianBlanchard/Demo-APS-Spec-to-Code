import { Knex } from 'knex';
import { EmailNotification } from '../entities/email-notification.entity';
import {
  EmailPriorityType,
  EmailStatusType,
  EmailStatus,
} from '../dto/email-notification.dto';

export interface IEmailNotificationRepository {
  create(
    notificationId: string,
    notification: Omit<EmailNotification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailNotification>;
  updateStatus(
    notificationId: string,
    status: EmailStatusType,
    sentAt?: Date,
    errorMessage?: string
  ): Promise<void>;
  incrementRetryCount(notificationId: string): Promise<void>;
  findByNotificationId(notificationId: string): Promise<EmailNotification | null>;
}

export class EmailNotificationRepository implements IEmailNotificationRepository {
  private readonly tableName = 'email_notifications';

  constructor(private readonly db: Knex) {}

  async create(
    notificationId: string,
    notification: Omit<EmailNotification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailNotification> {

    const [row] = await this.db(this.tableName)
      .insert({
        notification_id: notificationId,
        to: notification.to,
        template_id: notification.templateId,
        template_data: JSON.stringify(notification.templateData),
        priority: notification.priority,
        status: notification.status,
        sent_at: notification.sentAt,
        retry_count: notification.retryCount,
        error_message: notification.errorMessage,
      })
      .returning('*');

    return this.mapToEntity(row);
  }

  async updateStatus(
    notificationId: string,
    status: EmailStatusType,
    sentAt?: Date,
    errorMessage?: string
  ): Promise<void> {
    await this.db(this.tableName)
      .where({ notification_id: notificationId })
      .update({
        status,
        sent_at: sentAt || null,
        error_message: errorMessage || null,
        updated_at: this.db.fn.now(),
      });
  }

  async incrementRetryCount(notificationId: string): Promise<void> {
    await this.db(this.tableName)
      .where({ notification_id: notificationId })
      .update({
        retry_count: this.db.raw('retry_count + 1'),
        status: EmailStatus.RETRYING,
        updated_at: this.db.fn.now(),
      });
  }

  async findByNotificationId(notificationId: string): Promise<EmailNotification | null> {
    const row = await this.db(this.tableName).where({ notification_id: notificationId }).first();

    if (!row) {
      return null;
    }

    return this.mapToEntity(row);
  }

  private mapToEntity(row: any): EmailNotification {
    return {
      id: row.notification_id,
      to: row.to,
      templateId: row.template_id,
      templateData:
        typeof row.template_data === 'string'
          ? JSON.parse(row.template_data)
          : row.template_data,
      priority: row.priority as EmailPriorityType,
      status: row.status as EmailStatusType,
      sentAt: row.sent_at ? new Date(row.sent_at) : null,
      retryCount: row.retry_count,
      errorMessage: row.error_message,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
