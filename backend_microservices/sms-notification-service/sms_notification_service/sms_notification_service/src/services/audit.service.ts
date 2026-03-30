import { logger } from './logger.service';
import { MessageType, Priority, SmsStatus } from '../types/enums';

export interface AuditLogEntry {
  event: string;
  phoneNumber: string;
  messageType: MessageType;
  priority: Priority;
  status: SmsStatus;
  notificationId?: string;
  messageId?: string;
  retryCount?: number;
  failureReason?: string;
}

export interface IAuditService {
  logSmsSent(entry: AuditLogEntry): void;
  logSmsRetry(entry: AuditLogEntry): void;
  logSmsFailed(entry: AuditLogEntry): void;
  logCustomerOptedOut(entry: AuditLogEntry): void;
}

export class AuditService implements IAuditService {
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 6) return '***';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }

  logSmsSent(entry: AuditLogEntry): void {
    logger.info(
      {
        event: 'SMS_SENT',
        phoneNumber: this.maskPhoneNumber(entry.phoneNumber),
        messageType: entry.messageType,
        priority: entry.priority,
        status: entry.status,
        notificationId: entry.notificationId,
        messageId: entry.messageId,
      },
      'SMS notification sent successfully'
    );
  }

  logSmsRetry(entry: AuditLogEntry): void {
    logger.warn(
      {
        event: 'SMS_RETRY',
        phoneNumber: this.maskPhoneNumber(entry.phoneNumber),
        messageType: entry.messageType,
        priority: entry.priority,
        retryCount: entry.retryCount,
        failureReason: entry.failureReason,
      },
      'SMS notification retry attempt'
    );
  }

  logSmsFailed(entry: AuditLogEntry): void {
    logger.error(
      {
        event: 'SMS_FAILED',
        phoneNumber: this.maskPhoneNumber(entry.phoneNumber),
        messageType: entry.messageType,
        priority: entry.priority,
        status: entry.status,
        retryCount: entry.retryCount,
        failureReason: entry.failureReason,
      },
      'SMS notification failed after retries'
    );
  }

  logCustomerOptedOut(entry: AuditLogEntry): void {
    logger.info(
      {
        event: 'CUSTOMER_OPTED_OUT',
        phoneNumber: this.maskPhoneNumber(entry.phoneNumber),
        messageType: entry.messageType,
        status: entry.status,
      },
      'Customer has opted out of SMS notifications'
    );
  }
}
