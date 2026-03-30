export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR') {
    super(400, errorCode, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode: string = 'NOT_FOUND') {
    super(404, errorCode, message);
  }
}

export class EmailDeliveryError extends AppError {
  constructor(message: string, errorCode: string = 'EMAIL_DELIVERY_FAILED') {
    super(500, errorCode, message);
  }
}

export class TemplateError extends AppError {
  constructor(message: string, errorCode: string = 'TEMPLATE_ERROR') {
    super(400, errorCode, message);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, errorCode: string = 'EXTERNAL_SERVICE_ERROR') {
    super(502, errorCode, message);
  }
}
