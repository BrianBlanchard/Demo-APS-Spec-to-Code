import {
  AppError,
  ValidationError,
  CustomerOptedOutError,
  SmsDeliveryError,
  TwilioApiError,
} from '../errors';

describe('AppError', () => {
  it('should create an AppError with correct properties', () => {
    const error = new AppError('TEST_ERROR', 'Test error message', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.statusCode).toBe(400);
  });

  it('should default to status code 500 if not provided', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.statusCode).toBe(500);
  });

  it('should have a stack trace', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });

  it('should be catchable as Error', () => {
    try {
      throw new AppError('TEST_ERROR', 'Test error message');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    }
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError with correct properties', () => {
    const error = new ValidationError('Invalid input');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.errorCode).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
  });

  it('should be catchable as AppError', () => {
    try {
      throw new ValidationError('Invalid input');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
      }
    }
  });

  it('should have a stack trace', () => {
    const error = new ValidationError('Invalid input');

    expect(error.stack).toBeDefined();
  });
});

describe('CustomerOptedOutError', () => {
  it('should create a CustomerOptedOutError with correct properties', () => {
    const error = new CustomerOptedOutError('Customer opted out');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(CustomerOptedOutError);
    expect(error.name).toBe('CustomerOptedOutError');
    expect(error.errorCode).toBe('CUSTOMER_OPTED_OUT');
    expect(error.message).toBe('Customer opted out');
    expect(error.statusCode).toBe(400);
  });

  it('should be catchable as AppError', () => {
    try {
      throw new CustomerOptedOutError('Customer opted out');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('CUSTOMER_OPTED_OUT');
        expect(error.statusCode).toBe(400);
      }
    }
  });
});

describe('SmsDeliveryError', () => {
  it('should create a SmsDeliveryError with correct properties', () => {
    const error = new SmsDeliveryError('Failed to deliver SMS');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(SmsDeliveryError);
    expect(error.name).toBe('SmsDeliveryError');
    expect(error.errorCode).toBe('SMS_DELIVERY_ERROR');
    expect(error.message).toBe('Failed to deliver SMS');
    expect(error.statusCode).toBe(500);
  });

  it('should be catchable as AppError', () => {
    try {
      throw new SmsDeliveryError('Failed to deliver SMS');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('SMS_DELIVERY_ERROR');
        expect(error.statusCode).toBe(500);
      }
    }
  });
});

describe('TwilioApiError', () => {
  it('should create a TwilioApiError with correct properties', () => {
    const error = new TwilioApiError('Twilio API unavailable');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(TwilioApiError);
    expect(error.name).toBe('TwilioApiError');
    expect(error.errorCode).toBe('TWILIO_API_ERROR');
    expect(error.message).toBe('Twilio API unavailable');
    expect(error.statusCode).toBe(503);
  });

  it('should be catchable as AppError', () => {
    try {
      throw new TwilioApiError('Twilio API unavailable');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.errorCode).toBe('TWILIO_API_ERROR');
        expect(error.statusCode).toBe(503);
      }
    }
  });
});

describe('Error Inheritance Chain', () => {
  it('should properly maintain inheritance chain for all custom errors', () => {
    const errors = [
      new ValidationError('test'),
      new CustomerOptedOutError('test'),
      new SmsDeliveryError('test'),
      new TwilioApiError('test'),
    ];

    errors.forEach((error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.stack).toBeDefined();
      expect(error.errorCode).toBeDefined();
      expect(error.statusCode).toBeDefined();
      expect(error.message).toBe('test');
    });
  });

  it('should have unique error codes for each error type', () => {
    const errorCodes = [
      new ValidationError('test').errorCode,
      new CustomerOptedOutError('test').errorCode,
      new SmsDeliveryError('test').errorCode,
      new TwilioApiError('test').errorCode,
    ];

    const uniqueCodes = new Set(errorCodes);
    expect(uniqueCodes.size).toBe(errorCodes.length);
  });

  it('should have unique status codes appropriate to error types', () => {
    expect(new ValidationError('test').statusCode).toBe(400);
    expect(new CustomerOptedOutError('test').statusCode).toBe(400);
    expect(new SmsDeliveryError('test').statusCode).toBe(500);
    expect(new TwilioApiError('test').statusCode).toBe(503);
  });
});
