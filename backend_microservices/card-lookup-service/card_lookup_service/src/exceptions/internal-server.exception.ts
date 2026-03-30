import { BaseException } from './base.exception';

export class InternalServerException extends BaseException {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_SERVER_ERROR', message, 500);
  }
}
