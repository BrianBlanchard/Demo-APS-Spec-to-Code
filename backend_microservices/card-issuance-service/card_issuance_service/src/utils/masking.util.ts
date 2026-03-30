/**
 * Masking Utility
 * Provides methods to mask sensitive data for display and logging
 */
export class MaskingUtil {
  /**
   * Masks a 16-digit card number showing only the last 4 digits
   * @param cardNumber - Full 16-digit card number
   * @returns Masked format: ****-****-****-XXXX
   */
  static maskCardNumber(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      throw new Error('Card number must be exactly 16 digits');
    }

    const lastFour = cardNumber.slice(-4);
    return `****-****-****-${lastFour}`;
  }

  /**
   * Extracts the last 4 digits from a card number
   * @param cardNumber - Full 16-digit card number
   * @returns Last 4 digits
   */
  static extractLastFourDigits(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      throw new Error('Card number must be exactly 16 digits');
    }

    return cardNumber.slice(-4);
  }
}
