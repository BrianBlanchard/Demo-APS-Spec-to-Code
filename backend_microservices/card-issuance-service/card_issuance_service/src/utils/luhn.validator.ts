/**
 * Luhn Algorithm Validator
 * Validates card numbers using the Luhn checksum algorithm
 */
export class LuhnValidator {
  /**
   * Validates a card number using Luhn algorithm
   * @param cardNumber - 16-digit card number as string
   * @returns true if valid, false otherwise
   */
  static validate(cardNumber: string): boolean {
    if (!/^\d{16}$/.test(cardNumber)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    // Process digits from right to left
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
}
