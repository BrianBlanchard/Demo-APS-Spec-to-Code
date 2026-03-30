import pino from 'pino';
import { config } from '../config/config';
import { AsyncContext } from '../context/async-context';

export interface AuditEntry {
  entityType: string;
  entityId: number | string;
  action: string;
  userId?: string;
  source: string;
  ipAddress?: string;
  timestamp: Date;
  traceId: string;
  additionalData?: Record<string, unknown>;
}

export interface IAuditService {
  logAudit(entry: Omit<AuditEntry, 'timestamp' | 'traceId'>): void;
}

export class AuditService implements IAuditService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: config.logging.level,
      ...(config.logging.prettyPrint && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }),
    });
  }

  logAudit(entry: Omit<AuditEntry, 'timestamp' | 'traceId'>): void {
    const context = AsyncContext.getContext();

    const auditEntry: AuditEntry = {
      ...entry,
      timestamp: new Date(),
      traceId: context?.traceId || 'no-trace-id',
      userId: entry.userId || context?.userId,
      ipAddress: entry.ipAddress || context?.ipAddress,
    };

    // Mask sensitive data if present
    const maskedEntry = this.maskSensitiveData(auditEntry);

    this.logger.info(
      {
        audit: true,
        ...maskedEntry,
      },
      `AUDIT: ${maskedEntry.action} on ${maskedEntry.entityType}`,
    );
  }

  private maskSensitiveData(entry: AuditEntry): AuditEntry {
    // Create a copy to avoid mutating original
    const masked = { ...entry };

    // Mask any sensitive fields in additionalData
    if (masked.additionalData) {
      const sensitiveFields = ['cardNumber', 'pan', 'cvv', 'pin'];
      masked.additionalData = Object.entries(masked.additionalData).reduce(
        (acc, [key, value]) => {
          if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
            acc[key] = '***MASKED***';
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }

    return masked;
  }
}
