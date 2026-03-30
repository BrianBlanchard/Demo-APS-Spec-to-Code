import { SendSmsRequest, SendSmsResponse, SmsNotification } from '../dtos/sms.dto';
import { ISmsNotificationRepository } from '../repositories/sms-notification.repository';
import { ICustomerPreferenceRepository } from '../repositories/customer-preference.repository';
import { ITwilioService } from './twilio.service';
import { IAuditService } from './audit.service';
import { SmsStatus } from '../types/enums';
import { CustomerOptedOutError, SmsDeliveryError } from '../types/errors';
import { config } from '../config/config';

export interface ISmsNotificationService {
  sendSms(request: SendSmsRequest): Promise<SendSmsResponse>;
}

export class SmsNotificationService implements ISmsNotificationService {
  constructor(
    private readonly smsRepository: ISmsNotificationRepository,
    private readonly customerPrefRepository: ICustomerPreferenceRepository,
    private readonly twilioService: ITwilioService,
    private readonly auditService: IAuditService
  ) {}

  async sendSms(request: SendSmsRequest): Promise<SendSmsResponse> {
    const notificationId = this.generateNotificationId();

    // Check customer SMS preferences
    const customerPref = await this.customerPrefRepository.findByPhoneNumber(request.to);

    if (customerPref && !customerPref.smsOptIn) {
      // Customer opted out
      await this.createNotification(
        notificationId,
        request,
        SmsStatus.OPTED_OUT,
        null,
        'Customer has opted out of SMS notifications'
      );

      this.auditService.logCustomerOptedOut({
        event: 'CUSTOMER_OPTED_OUT',
        phoneNumber: request.to,
        messageType: request.messageType,
        priority: request.priority,
        status: SmsStatus.OPTED_OUT,
        notificationId,
      });

      throw new CustomerOptedOutError(
        'Customer has opted out of SMS notifications. Email fallback may be used if configured.'
      );
    }

    // Create initial notification record
    await this.createNotification(
      notificationId,
      request,
      SmsStatus.QUEUED,
      null,
      null
    );

    // Attempt to send SMS
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.retry.maxAttempts; attempt++) {
      try {
        const result = await this.twilioService.sendSms(request.to, request.message);

        // Update status to sent
        await this.smsRepository.updateStatus(
          notificationId,
          SmsStatus.SENT,
          result.messageId,
          null
        );

        const sentAt = new Date().toISOString();

        this.auditService.logSmsSent({
          event: 'SMS_SENT',
          phoneNumber: request.to,
          messageType: request.messageType,
          priority: request.priority,
          status: SmsStatus.SENT,
          notificationId,
          messageId: result.messageId,
        });

        return {
          notificationId,
          status: SmsStatus.SENT,
          sentAt,
          messageId: result.messageId,
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < config.retry.maxAttempts) {
          await this.smsRepository.incrementRetryCount(notificationId);

          this.auditService.logSmsRetry({
            event: 'SMS_RETRY',
            phoneNumber: request.to,
            messageType: request.messageType,
            priority: request.priority,
            status: SmsStatus.QUEUED,
            notificationId,
            retryCount: attempt + 1,
            failureReason: lastError.message,
          });

          await this.delay(config.retry.delayMs);
        }
      }
    }

    // All retries exhausted
    const failureReason = lastError?.message || 'Unknown error';

    await this.smsRepository.updateStatus(
      notificationId,
      SmsStatus.FAILED,
      null,
      failureReason
    );

    this.auditService.logSmsFailed({
      event: 'SMS_FAILED',
      phoneNumber: request.to,
      messageType: request.messageType,
      priority: request.priority,
      status: SmsStatus.FAILED,
      notificationId,
      retryCount: config.retry.maxAttempts,
      failureReason,
    });

    throw new SmsDeliveryError(
      `Failed to send SMS after ${config.retry.maxAttempts + 1} attempts. Email fallback may be used if configured.`
    );
  }

  private generateNotificationId(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SMS-${dateStr}-${random}`;
  }

  private async createNotification(
    notificationId: string,
    request: SendSmsRequest,
    status: SmsStatus,
    messageId: string | null,
    failureReason: string | null
  ): Promise<SmsNotification> {
    return this.smsRepository.create({
      notificationId,
      to: request.to,
      messageType: request.messageType,
      message: request.message,
      priority: request.priority,
      status,
      messageId,
      sentAt: status === SmsStatus.SENT ? new Date() : null,
      failureReason,
      retryCount: 0,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
