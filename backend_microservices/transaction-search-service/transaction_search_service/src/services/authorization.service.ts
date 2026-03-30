import { getRequestContext } from '../utils/context.storage';
import { AppError } from '../middleware/error.middleware';

export interface IAuthorizationService {
  validateAccountAccess(accountId?: string): void;
  validateCardAccess(cardNumber?: string): void;
}

export class AuthorizationService implements IAuthorizationService {
  validateAccountAccess(accountId?: string): void {
    if (!accountId) {
      return;
    }

    const context = getRequestContext();
    if (!context?.userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // In a real implementation, check if userId has access to accountId
    // For now, we'll do a basic validation
  }

  validateCardAccess(cardNumber?: string): void {
    if (!cardNumber) {
      return;
    }

    const context = getRequestContext();
    if (!context?.userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // In a real implementation, check if userId has access to cardNumber
    // For now, we'll do a basic validation
  }
}
