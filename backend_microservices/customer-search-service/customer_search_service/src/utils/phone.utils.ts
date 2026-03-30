/**
 * Normalize phone number to E.164 format
 * E.164 format: +[country code][subscriber number]
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it starts with country code (assuming US +1 for this example)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If it's 10 digits, assume US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Default: prepend +
  return `+${digits}`;
}

/**
 * Extract phone number variations for search
 */
export function getPhoneVariations(phone: string): string[] {
  const normalized = normalizePhoneNumber(phone);
  const digitsOnly = normalized.replace(/\D/g, '');

  const variations: string[] = [
    normalized, // +14155551234
    digitsOnly, // 14155551234
  ];

  // Add formatted variations
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const areaCode = digitsOnly.substring(1, 4);
    const prefix = digitsOnly.substring(4, 7);
    const lineNumber = digitsOnly.substring(7);

    variations.push(`(${areaCode}) ${prefix}-${lineNumber}`); // (415) 555-1234
    variations.push(`${areaCode}-${prefix}-${lineNumber}`); // 415-555-1234
    variations.push(digitsOnly.substring(1)); // 4155551234
  }

  return [...new Set(variations)];
}
