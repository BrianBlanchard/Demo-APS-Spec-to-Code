import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Access forbidden') {
    super('ACCESS_FORBIDDEN', message, 403);
  }
}
