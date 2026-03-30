export class AppError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class CustomerOptedOutError extends AppError {
  constructor(message: string) {
    super('CUSTOMER_OPTED_OUT', message, 400);
    this.name = 'CustomerOptedOutError';
  }
}

export class SmsDeliveryError extends AppError {
  constructor(message: string) {
    super('SMS_DELIVERY_ERROR', message, 500);
    this.name = 'SmsDeliveryError';
  }
}

export class TwilioApiError extends AppError {
  constructor(message: string) {
    super('TWILIO_API_ERROR', message, 503);
    this.name = 'TwilioApiError';
  }
}
