import { logger } from '../config/logger';
import { getTraceId } from '../middleware/request-context';

export interface AuditLogData {
  operation: string;
  status: 'success' | 'failure' | 'retry';
  details: Record<string, any>;
}

export interface AuditService {
  log(data: AuditLogData): void;
}

export class AuditServiceImpl implements AuditService {
  log(data: AuditLogData): void {
    const maskedDetails = this.maskSensitiveData(data.details);

    logger.info(
      {
        timestamp: new Date().toISOString(),
        traceId: getTraceId(),
        operation: data.operation,
        status: data.status,
        details: maskedDetails,
      },
      `Audit: ${data.operation} - ${data.status}`,
    );
  }

  private maskSensitiveData(details: Record<string, any>): Record<string, any> {
    const masked = { ...details };

    if (masked.cardNumber && typeof masked.cardNumber === 'string') {
      masked.cardNumber = this.maskCardNumber(masked.cardNumber);
    }

    if (masked.accountId && typeof masked.accountId === 'string') {
      masked.accountId = this.maskAccountId(masked.accountId);
    }

    // Mask amounts > 10000 to show only range
    if (masked.amount && typeof masked.amount === 'number' && masked.amount > 10000) {
      masked.amount = '>10000';
    }

    return masked;
  }

  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      return '****';
    }
    return `************${cardNumber.slice(-4)}`;
  }

  private maskAccountId(accountId: string): string {
    if (accountId.length < 4) {
      return '****';
    }
    return `*******${accountId.slice(-4)}`;
  }
}
