import { logger } from '../infrastructure/logger';
import { UserRole } from '../types/user-role.type';

export interface IAuditService {
  logCardAccess(
    cardNumber: string,
    userId: string,
    userRole: UserRole,
    accessGranted: boolean,
    reason?: string
  ): void;
  logFullCardNumberAccess(cardNumber: string, userId: string): void;
}

export class AuditService implements IAuditService {
  logCardAccess(
    cardNumber: string,
    userId: string,
    userRole: UserRole,
    accessGranted: boolean,
    reason?: string
  ): void {
    const maskedCardNumber = '****' + cardNumber.slice(-4);

    logger.info(
      {
        event: 'CARD_ACCESS',
        maskedCardNumber,
        userId: this.maskSensitiveId(userId),
        userRole,
        accessGranted,
        reason,
      },
      'Card access attempt'
    );
  }

  logFullCardNumberAccess(cardNumber: string, userId: string): void {
    const maskedCardNumber = '****' + cardNumber.slice(-4);

    logger.warn(
      {
        event: 'FULL_CARD_ACCESS',
        maskedCardNumber,
        userId: this.maskSensitiveId(userId),
        severity: 'HIGH',
        alertSecurityTeam: true,
      },
      'Full card number accessed by admin'
    );
  }

  private maskSensitiveId(id: string): string {
    if (id.length <= 4) {
      return '****';
    }
    return '****' + id.slice(-4);
  }
}
