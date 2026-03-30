import { randomBytes } from 'crypto';

export function generateNotificationId(): string {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `EMAIL-${timestamp}-${random}`;
}

export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}
