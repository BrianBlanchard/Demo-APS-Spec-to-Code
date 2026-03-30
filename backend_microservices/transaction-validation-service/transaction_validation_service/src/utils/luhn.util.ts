/**
 * Validates a card number using the Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns true if valid, false otherwise
 */
export function validateLuhn(cardNumber: string): boolean {
  if (!/^\d+$/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
