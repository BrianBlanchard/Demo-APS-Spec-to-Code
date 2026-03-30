import { logger } from '../utils/logger';
import { getTraceId } from '../utils/request-context';

export interface IAuditService {
  log(action: string, customerId: string, status: 'SUCCESS' | 'FAILURE', details?: string): void;
}

export class AuditService implements IAuditService {
  log(action: string, customerId: string, status: 'SUCCESS' | 'FAILURE', details?: string): void {
    const traceId = getTraceId();
    const timestamp = new Date().toISOString();

    // Mask sensitive data in details
    const maskedDetails = details ? this.maskSensitiveData(details) : undefined;

    logger.info(
      {
        audit: true,
        action,
        customerId: this.maskCustomerId(customerId),
        status,
        details: maskedDetails,
        timestamp,
        traceId,
      },
      'Audit log'
    );
  }

  private maskCustomerId(customerId: string): string {
    if (customerId.length <= 4) {
      return '****';
    }
    return customerId.slice(0, 2) + '****' + customerId.slice(-2);
  }

  private maskSensitiveData(data: string): string {
    // Replace potential PII patterns
    return data
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****') // SSN
      .replace(/\b\d{16}\b/g, '****-****-****-****') // Credit card
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***'); // Email
  }
}
