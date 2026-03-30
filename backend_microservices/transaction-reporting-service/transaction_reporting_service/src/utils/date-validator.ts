import { parseISO, isAfter, isFuture, differenceInDays } from 'date-fns';
import { ValidationError } from './errors';

export function validateDateRange(startDate: string, endDate: string): void {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isFuture(start)) {
    throw new ValidationError('Start date cannot be in the future');
  }

  if (isFuture(end)) {
    throw new ValidationError('End date cannot be in the future');
  }

  if (isAfter(start, end)) {
    throw new ValidationError('Start date must be before or equal to end date');
  }
}

export function isLargeDateRange(startDate: string, endDate: string): boolean {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const threshold = parseInt(process.env.ASYNC_REPORT_THRESHOLD_DAYS || '90', 10);
  return differenceInDays(end, start) > threshold;
}
