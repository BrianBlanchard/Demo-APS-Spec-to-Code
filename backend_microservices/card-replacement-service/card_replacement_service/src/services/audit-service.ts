import { IAuditRepository } from '../repositories/audit-repository';
import { getTraceId, getUserId } from '../utils/trace-context';
import { maskCardNumber } from '../utils/card-generator';

export interface IAuditService {
  logCardReplacement(
    originalCardNumber: string,
    replacementCardNumber: string,
    reason: string,
    status: 'success' | 'failure',
    additionalData?: Record<string, unknown>,
  ): Promise<void>;
  logCardStatusChange(
    cardNumber: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
  ): Promise<void>;
}

export class AuditService implements IAuditService {
  constructor(private readonly auditRepository: IAuditRepository) {}

  async logCardReplacement(
    originalCardNumber: string,
    replacementCardNumber: string,
    reason: string,
    status: 'success' | 'failure',
    additionalData?: Record<string, unknown>,
  ): Promise<void> {
    const traceId = getTraceId();
    const userId = getUserId() || 'system';

    const eventData = {
      originalCard: maskCardNumber(originalCardNumber),
      replacementCard: maskCardNumber(replacementCardNumber),
      reason,
      status,
      ...additionalData,
    };

    await this.auditRepository.create({
      eventType: 'card_replacement',
      entityType: 'card',
      entityId: originalCardNumber,
      userId,
      traceId,
      eventData,
    });
  }

  async logCardStatusChange(
    cardNumber: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
  ): Promise<void> {
    const traceId = getTraceId();
    const userId = getUserId() || 'system';

    const eventData = {
      cardNumber: maskCardNumber(cardNumber),
      oldStatus,
      newStatus,
      reason,
    };

    await this.auditRepository.create({
      eventType: 'card_status_change',
      entityType: 'card',
      entityId: cardNumber,
      userId,
      traceId,
      eventData,
    });
  }
}
