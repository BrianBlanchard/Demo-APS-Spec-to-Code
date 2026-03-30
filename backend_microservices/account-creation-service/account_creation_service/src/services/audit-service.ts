import { AuditRepository } from '../repositories/audit-repository';
import { AuditAction, AuditEntityType } from '../types/enums';
import { getRequestContext } from '../context/request-context';
import logger from '../logger/logger';

export interface AuditService {
  logAccountCreation(accountId: string, accountData: Record<string, unknown>): Promise<void>;
}

export class AuditServiceImpl implements AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAccountCreation(
    accountId: string,
    accountData: Record<string, unknown>
  ): Promise<void> {
    try {
      const context = getRequestContext();

      // Mask sensitive data
      const maskedData = this.maskSensitiveData(accountData);

      await this.auditRepository.createAuditLog({
        action: AuditAction.CREATE,
        entity_type: AuditEntityType.ACCOUNT,
        entity_id: accountId,
        user_id: context?.userId || null,
        field_name: null,
        old_value: null,
        new_value: JSON.stringify(maskedData),
        source: 'UI',
        ip_address: context?.ipAddress || null,
      });

      logger.info({ accountId }, 'Account creation audit log created');
    } catch (error) {
      logger.error({ error, accountId }, 'Failed to create audit log');
      // Don't throw - audit logging failure should not fail the operation
    }
  }

  private maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...data };

    // Mask sensitive fields if present
    const sensitiveFields = ['customerId', 'customer_id'];
    sensitiveFields.forEach((field) => {
      if (masked[field]) {
        const value = String(masked[field]);
        masked[field] = value.length > 4 ? `***${value.slice(-4)}` : '***';
      }
    });

    return masked;
  }
}
