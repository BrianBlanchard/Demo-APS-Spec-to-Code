import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  constructor(message: string = 'Validation failed') {
    super('VALIDATION_ERROR', message, 400);
  }
}
