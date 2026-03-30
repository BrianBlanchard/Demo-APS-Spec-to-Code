import { randomInt } from 'crypto';

export function generateCardNumber(): string {
  // Generate a 16-digit card number (simplified - not using Luhn algorithm for demo)
  let cardNumber = '';
  for (let i = 0; i < 16; i++) {
    cardNumber += randomInt(0, 10).toString();
  }
  return cardNumber;
}

export function generateCVV(): string {
  // Generate a 3-digit CVV
  return randomInt(0, 1000).toString().padStart(3, '0');
}

export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length !== 16) {
    return cardNumber;
  }
  return '************' + cardNumber.slice(-4);
}

export function calculateExpirationDate(yearsFromNow: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + yearsFromNow);
  // Set to last day of the month
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date;
}

export function formatExpirationDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

export function calculateEstimatedDelivery(expedited: boolean): Date {
  const date = new Date();
  if (expedited) {
    date.setDate(date.getDate() + 2); // 2 days for expedited
  } else {
    date.setDate(date.getDate() + 7); // 7 days for standard
  }
  return date;
}
