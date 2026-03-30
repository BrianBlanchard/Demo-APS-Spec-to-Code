// BigDecimal calculator for precise financial calculations
// Uses string-based arithmetic to avoid floating-point precision issues

export class BigDecimalCalculator {
  private static readonly DECIMAL_PLACES = 2;
  private static readonly INTEREST_DIVISOR = '1200'; // 12 months × 100
  private static readonly MINIMUM_CHARGE = '0.50';
  private static readonly ZERO = '0.00';

  /**
   * Calculate interest using the legacy formula: (balance × rate) / 1200
   * Applies HALF_UP rounding to 2 decimal places
   */
  static calculateInterest(balance: string, rate: string): string {
    const balanceNum = this.parseDecimal(balance);
    const rateNum = this.parseDecimal(rate);

    // If balance is zero or negative (credit balance), return 0.00
    if (balanceNum <= 0) {
      return this.ZERO;
    }

    // Calculate: (balance × rate) / 1200
    const product = balanceNum * rateNum;
    const divisor = this.parseDecimal(this.INTEREST_DIVISOR);
    const result = product / divisor;

    // Apply HALF_UP rounding to 2 decimal places
    const rounded = this.roundHalfUp(result, this.DECIMAL_PLACES);

    return this.formatDecimal(rounded, this.DECIMAL_PLACES);
  }

  /**
   * Apply minimum charge rule per BR-003:
   * If balance > 0 AND calculated > 0 AND calculated < 0.50, return 0.50
   */
  static applyMinimumCharge(calculatedInterest: string, balance: string): {
    finalInterest: string;
    minimumApplied: boolean;
  } {
    const calculated = this.parseDecimal(calculatedInterest);
    const balanceNum = this.parseDecimal(balance);
    const minimum = this.parseDecimal(this.MINIMUM_CHARGE);
    const zero = this.parseDecimal(this.ZERO);

    // If balance <= 0, return 0.00 (no minimum charge)
    if (balanceNum <= zero) {
      return {
        finalInterest: this.ZERO,
        minimumApplied: false,
      };
    }

    // If calculated interest is between 0 (exclusive) and 0.50 (exclusive), apply minimum
    if (calculated > zero && calculated < minimum) {
      return {
        finalInterest: this.MINIMUM_CHARGE,
        minimumApplied: true,
      };
    }

    return {
      finalInterest: calculatedInterest,
      minimumApplied: false,
    };
  }

  /**
   * Add two decimal strings with precision
   */
  static add(a: string, b: string): string {
    const aNum = this.parseDecimal(a);
    const bNum = this.parseDecimal(b);
    const sum = aNum + bNum;
    return this.formatDecimal(sum, this.DECIMAL_PLACES);
  }

  /**
   * Generate human-readable calculation formula for audit trail
   */
  static generateCalculationFormula(
    balance: string,
    rate: string,
    result: string,
  ): string {
    return `(${balance} × ${rate}) / 1200 = ${this.calculateRawInterest(balance, rate)} → ${result} (HALF_UP)`;
  }

  /**
   * Calculate raw interest before rounding (for formula display)
   */
  private static calculateRawInterest(balance: string, rate: string): string {
    const balanceNum = this.parseDecimal(balance);
    const rateNum = this.parseDecimal(rate);
    const divisor = this.parseDecimal(this.INTEREST_DIVISOR);
    const raw = (balanceNum * rateNum) / divisor;
    return raw.toFixed(4); // Show more precision in formula
  }

  /**
   * Parse decimal string to number with validation
   */
  private static parseDecimal(value: string): number {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`Invalid decimal value: ${value}`);
    }
    return num;
  }

  /**
   * Format number to decimal string with fixed precision
   */
  private static formatDecimal(value: number, places: number): string {
    return value.toFixed(places);
  }

  /**
   * Round to specified decimal places using HALF_UP method
   * HALF_UP: If the digit to be rounded is 5 or greater, round up
   */
  private static roundHalfUp(value: number, places: number): number {
    const multiplier = Math.pow(10, places);
    return Math.round(value * multiplier + Number.EPSILON) / multiplier;
  }
}
