import crypto from 'crypto';

/**
 * Generates a unique validation ID
 * @returns Validation ID in format VAL-YYYYMMDD-XXXXXX
 */
export function generateValidationId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VAL-${dateStr}-${random}`;
}

/**
 * Generates a unique authorization code
 * @returns Authorization code in format AUTHXXXXXX
 */
export function generateAuthorizationCode(): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AUTH${random}`;
}

/**
 * Generates a trace ID for request tracking
 * @returns Trace ID as UUID v4
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}
