/**
 * Masks a card number showing only the last 4 digits
 * @param cardNumber - The card number to mask
 * @returns Masked card number (e.g., ************1234)
 */
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 4) {
    return '*'.repeat(cardNumber.length);
  }
  return '*'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
}

/**
 * Masks sensitive data in log messages
 * @param data - The data object to mask
 * @returns Masked data object
 */
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data };

  if (typeof masked.cardNumber === 'string') {
    masked.cardNumber = maskCardNumber(masked.cardNumber);
  }

  if ('cvv' in masked) {
    masked.cvv = '***';
  }

  return masked;
}
