import { logger } from '../utils/logger';

export interface AuditLogEntry {
  action: string;
  accountId: string;
  details: Record<string, unknown>;
  success: boolean;
}

export interface IAuditService {
  log(entry: AuditLogEntry): void;
}

export class AuditService implements IAuditService {
  log(entry: AuditLogEntry): void {
    const maskedDetails = this.maskSensitiveData(entry.details);

    logger.info(
      {
        audit: {
          action: entry.action,
          accountId: this.maskAccountId(entry.accountId),
          details: maskedDetails,
          success: entry.success,
        },
      },
      'Audit log'
    );
  }

  private maskAccountId(accountId: string): string {
    if (accountId.length <= 4) {
      return '***';
    }
    return '***' + accountId.slice(-4);
  }

  private maskSensitiveData(details: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(details)) {
      if (key.toLowerCase().includes('id') && typeof value === 'string') {
        masked[key] = this.maskAccountId(value);
      } else if (
        (key.toLowerCase().includes('balance') ||
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('credit')) &&
        typeof value === 'number'
      ) {
        masked[key] = '***';
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}
