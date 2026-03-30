import { logger } from '../utils/logger';
import { AccountStatus } from '../enums/account-status.enum';
import { StatusChangeReason } from '../enums/status-change-reason.enum';
import { IAuditService } from './audit.service';

export interface NotificationPayload {
  accountId: string;
  previousStatus: AccountStatus;
  newStatus: AccountStatus;
  reason: StatusChangeReason;
  effectiveDate: Date;
}

export interface INotificationService {
  sendStatusChangeNotification(payload: NotificationPayload): Promise<boolean>;
}

export class NotificationService implements INotificationService {
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(private readonly auditService: IAuditService) {
    this.maxRetries = parseInt(process.env.NOTIFICATION_RETRY_MAX_ATTEMPTS || '3', 10);
    this.retryDelay = parseInt(process.env.NOTIFICATION_RETRY_DELAY_MS || '1000', 10);
  }

  async sendStatusChangeNotification(payload: NotificationPayload): Promise<boolean> {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      attempt++;

      try {
        // Simulate notification sending (replace with actual HTTP call to notification service)
        logger.info('Sending status change notification', {
          accountId: payload.accountId,
          newStatus: payload.newStatus,
          attempt,
        });

        // Simulate network call
        // In production: await axios.post(notificationServiceUrl, payload)
        const success = Math.random() > 0.1; // 90% success rate for simulation

        if (success) {
          logger.info('Notification sent successfully', {
            accountId: payload.accountId,
            attempt,
          });
          return true;
        }

        throw new Error('Notification service returned error');
      } catch (error) {
        this.auditService.logRetry(payload.accountId, attempt, this.maxRetries);

        if (attempt >= this.maxRetries) {
          logger.error('Failed to send notification after maximum retries', error as Error, {
            accountId: payload.accountId,
            attempts: attempt,
          });
          return false;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    return false;
  }
}
