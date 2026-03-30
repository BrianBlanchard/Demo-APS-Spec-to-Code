import { logger } from '../config/logger';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  additionalContext?: Record<string, unknown>;
}

export interface IAuditService {
  logAudit(entry: AuditEntry): void;
}

export class AuditService implements IAuditService {
  logAudit(entry: AuditEntry): void {
    // Mask sensitive information
    const maskedEntry = this.maskSensitiveData(entry);

    logger.info(
      {
        audit: true,
        ...maskedEntry,
      },
      `Audit: ${entry.action} on ${entry.entityType}`,
    );
  }

  private maskSensitiveData(entry: AuditEntry): AuditEntry {
    // Clone the entry to avoid mutating the original
    const masked = { ...entry };

    // Mask account IDs (show only last 4 digits)
    if (masked.entityId && masked.entityId.length >= 4) {
      masked.entityId = `***${masked.entityId.slice(-4)}`;
    }

    // Mask sensitive values in context
    if (masked.additionalContext) {
      masked.additionalContext = this.maskContextValues(masked.additionalContext);
    }

    return masked;
  }

  private maskContextValues(context: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      // Mask account-related fields
      if (key.toLowerCase().includes('account') && typeof value === 'string' && value.length >= 4) {
        masked[key] = `***${value.slice(-4)}`;
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }
}
