import { UserRole } from '../types/user-role.type';

export interface IMaskingService {
  maskCardNumber(cardNumber: string, userRole: UserRole): string;
  maskCvv(): string;
}

export class MaskingService implements IMaskingService {
  maskCardNumber(cardNumber: string, userRole: UserRole): string {
    if (!cardNumber || cardNumber.length !== 16) {
      return '****************';
    }

    switch (userRole) {
      case UserRole.ADMIN:
        // Admin sees full card number
        return cardNumber;
      case UserRole.CSR:
        // CSR sees last 6 digits
        return '*'.repeat(10) + cardNumber.slice(-6);
      case UserRole.CUSTOMER:
      default:
        // Customer sees last 4 digits
        return '*'.repeat(12) + cardNumber.slice(-4);
    }
  }

  maskCvv(): string {
    return '***';
  }
}
