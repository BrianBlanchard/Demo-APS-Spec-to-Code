import { IAuditRepository } from '../repositories/auditRepository';
import { AdminAction } from '../models/types';
import { logger } from '../config/logger';
import { getContext } from '../middlewares/context';

export interface IAuditService {
  logAdminAction(
    action: AdminAction,
    targetUserId: string | null,
    details: Record<string, unknown> | null
  ): Promise<void>;
}

export class AuditService implements IAuditService {
  constructor(private readonly auditRepository: IAuditRepository) {}

  async logAdminAction(
    action: AdminAction,
    targetUserId: string | null,
    details: Record<string, unknown> | null
  ): Promise<void> {
    const context = getContext();

    if (!context?.adminId) {
      logger.warn({ action, targetUserId }, 'Admin ID not found in context for audit logging');
      return;
    }

    try {
      // Mask sensitive data in details
      const maskedDetails = this.maskSensitiveData(details);

      await this.auditRepository.createAuditLog(
        context.adminId,
        action,
        targetUserId,
        maskedDetails,
        context.ipAddress
      );

      logger.info(
        {
          traceId: context.traceId,
          action,
          targetUserId,
          adminId: context.adminId,
        },
        'Admin action logged'
      );
    } catch (error) {
      // Audit logging failures should not break the main flow
      logger.error({ error, action, targetUserId }, 'Failed to log admin action');
    }
  }

  private maskSensitiveData(
    details: Record<string, unknown> | null
  ): Record<string, unknown> | null {
    if (!details) {
      return null;
    }

    const masked = { ...details };

    // Mask sensitive fields
    const sensitiveFields = ['password', 'ssn', 'credit_card', 'bank_account'];
    sensitiveFields.forEach((field) => {
      if (field in masked) {
        masked[field] = '***MASKED***';
      }
    });

    return masked;
  }
}
