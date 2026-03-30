import { BaseException } from './base.exception';

export class AccountNotFoundException extends BaseException {
  constructor(accountId: string) {
    super(`Account not found: ${accountId}`, 404, 'ACCOUNT_NOT_FOUND');
  }
}
