import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super('RESOURCE_NOT_FOUND', message, 404);
  }
}
