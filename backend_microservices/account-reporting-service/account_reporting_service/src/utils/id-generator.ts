import { randomBytes } from 'crypto';

export function generateReportId(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `RPT-${date}-${random}`;
}

export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}
