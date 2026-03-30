/**
 * Detect if query looks like an email
 */
export function isEmailLike(query: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
}

/**
 * Detect if query looks like a phone number
 */
export function isPhoneLike(query: string): boolean {
  const digitsOnly = query.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '***';
  }
  return data.substring(0, visibleChars) + '***';
}
