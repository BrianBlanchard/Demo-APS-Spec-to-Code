import { BaseException } from './base.exception';

export class ConcurrentModificationException extends BaseException {
  constructor(accountId: string) {
    super(
      `Account status was changed by another user. Account ID: ${accountId}`,
      409,
      'CONCURRENT_MODIFICATION'
    );
  }
}
