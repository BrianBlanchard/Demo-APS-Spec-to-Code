import { IAuditRepository } from '../repositories/AuditRepository';
import { AuditLogEntity, CustomerEntity } from '../types/entities';
import { logger } from '../config/logger';
import { maskSensitiveData } from '../utils/masking';

export interface IAuditService {
  logFieldChanges(
    customerId: string,
    oldEntity: CustomerEntity,
    updates: Partial<CustomerEntity>,
    changedBy: string,
    ipAddress: string,
    traceId?: string
  ): Promise<void>;
}

export class AuditService implements IAuditService {
  private readonly sensitiveFields = ['ssn', 'government_id', 'fico_score', 'eft_account_id'];

  constructor(private readonly auditRepository: IAuditRepository) {}

  async logFieldChanges(
    customerId: string,
    oldEntity: CustomerEntity,
    updates: Partial<CustomerEntity>,
    changedBy: string,
    ipAddress: string,
    traceId?: string
  ): Promise<void> {
    const auditLogs: AuditLogEntity[] = [];

    for (const [key, newValue] of Object.entries(updates)) {
      if (key === 'version' || key === 'updated_at' || key === 'updated_by') {
        continue;
      }

      const oldValue = oldEntity[key as keyof CustomerEntity];

      if (oldValue !== newValue) {
        const isSensitive = this.sensitiveFields.includes(key);

        auditLogs.push({
          customer_id: customerId,
          field_name: key,
          old_value: this.maskValueIfSensitive(String(oldValue || ''), isSensitive),
          new_value: this.maskValueIfSensitive(String(newValue || ''), isSensitive),
          changed_by: changedBy,
          ip_address: ipAddress,
          trace_id: traceId,
        });
      }
    }

    if (auditLogs.length > 0) {
      await this.auditRepository.createBatch(auditLogs);
      logger.info(
        { customerId, changedBy, fieldCount: auditLogs.length },
        'Audit logs created for customer update'
      );
    }
  }

  private maskValueIfSensitive(value: string, isSensitive: boolean): string {
    if (!isSensitive) {
      return value;
    }
    return maskSensitiveData(value);
  }
}
