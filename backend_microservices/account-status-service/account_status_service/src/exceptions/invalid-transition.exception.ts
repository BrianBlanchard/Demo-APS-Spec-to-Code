import { BaseException } from './base.exception';
import { AccountStatus } from '../enums/account-status.enum';

export class InvalidTransitionException extends BaseException {
  constructor(accountId: string, currentStatus: AccountStatus, newStatus: AccountStatus) {
    super(
      `Cannot transition from ${currentStatus} to ${newStatus}. Account ID: ${accountId}, Current Status: ${currentStatus}`,
      422,
      'INVALID_STATUS_TRANSITION'
    );
  }
}
