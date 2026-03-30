import { format } from 'date-fns';

export function generateReportId(): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const randomStr = generateRandomString(6);
  return `RPT-${dateStr}-${randomStr}`;
}

export function generateTraceId(): string {
  return `${Date.now()}-${generateRandomString(8)}`;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
