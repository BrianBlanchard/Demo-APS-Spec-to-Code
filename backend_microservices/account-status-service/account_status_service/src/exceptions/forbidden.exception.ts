import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}
