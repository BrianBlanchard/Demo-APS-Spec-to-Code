import { BigDecimalCalculator } from '../../src/utils/bigDecimalCalculator';

describe('BigDecimalCalculator', () => {
  describe('calculateInterest', () => {
    describe('standard calculations', () => {
      it('should calculate interest correctly for typical balance', () => {
        const result = BigDecimalCalculator.calculateInterest('2500.00', '18.990');
        expect(result).toBe('39.56');
      });

      it('should calculate interest for cash advance balance', () => {
        const result = BigDecimalCalculator.calculateInterest('500.00', '24.990');
        expect(result).toBe('10.41');
      });

      it('should handle small balances', () => {
        const result = BigDecimalCalculator.calculateInterest('100.00', '18.990');
        expect(result).toBe('1.58');
      });

      it('should handle large balances', () => {
        const result = BigDecimalCalculator.calculateInterest('999999.99', '18.990');
        // (999999.99 * 18.990) / 1200 = 15825.00
        expect(result).toBe('15825.00');
      });

      it('should handle zero balance', () => {
        const result = BigDecimalCalculator.calculateInterest('0.00', '18.990');
        expect(result).toBe('0.00');
      });

      it('should handle negative (credit) balance', () => {
        const result = BigDecimalCalculator.calculateInterest('-100.00', '18.990');
        expect(result).toBe('0.00');
      });
    });

    describe('HALF_UP rounding', () => {
      it('should round up when digit is 5 or greater', () => {
        // 10.125 should round to 10.13
        const balance = '640.00';
        const rate = '18.990';
        const result = BigDecimalCalculator.calculateInterest(balance, rate);
        // (640 * 18.990) / 1200 = 10.128 -> 10.13
        expect(result).toBe('10.13');
      });

      it('should round down when digit is less than 5', () => {
        const balance = '100.00';
        const rate = '15.000';
        const result = BigDecimalCalculator.calculateInterest(balance, rate);
        // (100 * 15) / 1200 = 1.25 -> 1.25
        expect(result).toBe('1.25');
      });

      it('should round exactly .5 up (HALF_UP)', () => {
        const balance = '30.00';
        const rate = '20.000';
        const result = BigDecimalCalculator.calculateInterest(balance, rate);
        // (30 * 20) / 1200 = 0.5 -> 0.50
        expect(result).toBe('0.50');
      });

      it('should always return 2 decimal places', () => {
        const result = BigDecimalCalculator.calculateInterest('1000.00', '12.000');
        expect(result).toMatch(/^\d+\.\d{2}$/);
        expect(result).toBe('10.00');
      });
    });

    describe('edge cases', () => {
      it('should handle very small interest (less than 1 cent)', () => {
        const result = BigDecimalCalculator.calculateInterest('1.00', '18.990');
        // (1 * 18.990) / 1200 = 0.015825 -> 0.02
        expect(result).toBe('0.02');
      });

      it('should handle precise decimal inputs', () => {
        const result = BigDecimalCalculator.calculateInterest('2500.00', '18.990');
        // (2500 * 18.990) / 1200 = 39.5625 -> 39.56
        expect(result).toBe('39.56');
      });

      it('should handle rates with 3 decimal places', () => {
        const result = BigDecimalCalculator.calculateInterest('1000.00', '18.990');
        expect(result).toBe('15.83');
      });

      it('should handle whole number rates', () => {
        const result = BigDecimalCalculator.calculateInterest('1200.00', '10.000');
        expect(result).toBe('10.00');
      });

      it('should handle fractional cents in balance', () => {
        const result = BigDecimalCalculator.calculateInterest('1234.56', '18.990');
        // (1234.56 * 18.990) / 1200 = 19.54
        expect(result).toBe('19.54');
      });
    });

    describe('formula verification', () => {
      it('should match formula: (balance × rate) / 1200', () => {
        const balance = 2500.0;
        const rate = 18.99;
        const expected = ((balance * rate) / 1200).toFixed(2);

        const result = BigDecimalCalculator.calculateInterest('2500.00', '18.990');
        expect(result).toBe(expected);
      });

      it('should divide by 1200 (12 months × 100)', () => {
        // For 12% annual rate, monthly should be 1%
        const result = BigDecimalCalculator.calculateInterest('1200.00', '12.000');
        // (1200 * 12) / 1200 = 12
        expect(result).toBe('12.00');
      });
    });
  });

  describe('applyMinimumCharge', () => {
    describe('minimum charge rule ($0.50)', () => {
      it('should apply minimum charge when calculated < $0.50 and balance > 0', () => {
        const calculated = '0.25';
        const balance = '100.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.50');
        expect(result.minimumApplied).toBe(true);
      });

      it('should apply minimum charge for very small calculated interest', () => {
        const calculated = '0.01';
        const balance = '50.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.50');
        expect(result.minimumApplied).toBe(true);
      });

      it('should apply minimum charge when interest rounds to $0.00', () => {
        // When calculated is > 0 but < 0.50 (exclusive bounds)
        const calculated = '0.49';
        const balance = '100.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.50');
        expect(result.minimumApplied).toBe(true);
      });

      it('should NOT apply minimum charge when calculated >= $0.50', () => {
        const calculated = '0.50';
        const balance = '100.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.50');
        expect(result.minimumApplied).toBe(false);
      });

      it('should NOT apply minimum charge when calculated > $0.50', () => {
        const calculated = '5.00';
        const balance = '1000.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('5.00');
        expect(result.minimumApplied).toBe(false);
      });
    });

    describe('zero balance rule', () => {
      it('should return $0.00 for zero balance', () => {
        const calculated = '5.00';
        const balance = '0.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.00');
        expect(result.minimumApplied).toBe(false);
      });

      it('should NOT apply minimum charge for zero balance', () => {
        const calculated = '0.25';
        const balance = '0.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.00');
        expect(result.minimumApplied).toBe(false);
      });
    });

    describe('credit balance rule', () => {
      it('should return $0.00 for negative (credit) balance', () => {
        const calculated = '5.00';
        const balance = '-100.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.00');
        expect(result.minimumApplied).toBe(false);
      });

      it('should NOT apply minimum charge for credit balance', () => {
        const calculated = '0.25';
        const balance = '-50.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.00');
        expect(result.minimumApplied).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle exactly $0.50 calculated interest', () => {
        const calculated = '0.50';
        const balance = '100.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('0.50');
        expect(result.minimumApplied).toBe(false);
      });

      it('should handle $0.00 calculated interest with positive balance', () => {
        // This should NOT trigger minimum charge (balance > 0, but calculated = 0)
        const calculated = '0.00';
        const balance = '0.01';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        // According to BR-003: minimum applies if calculated > 0 AND < 0.50
        // If calculated = 0, no minimum charge
        expect(result.finalInterest).toBe('0.00');
        expect(result.minimumApplied).toBe(false);
      });

      it('should handle large calculated interest', () => {
        const calculated = '999.99';
        const balance = '50000.00';

        const result = BigDecimalCalculator.applyMinimumCharge(calculated, balance);

        expect(result.finalInterest).toBe('999.99');
        expect(result.minimumApplied).toBe(false);
      });
    });
  });

  describe('add', () => {
    it('should add two decimal strings correctly', () => {
      const result = BigDecimalCalculator.add('10.50', '5.25');
      expect(result).toBe('15.75');
    });

    it('should handle adding zero', () => {
      const result = BigDecimalCalculator.add('10.00', '0.00');
      expect(result).toBe('10.00');
    });

    it('should handle adding negative values', () => {
      const result = BigDecimalCalculator.add('10.00', '-5.00');
      expect(result).toBe('5.00');
    });

    it('should maintain 2 decimal places', () => {
      const result = BigDecimalCalculator.add('1.11', '2.22');
      expect(result).toBe('3.33');
      expect(result).toMatch(/^\d+\.\d{2}$/);
    });

    it('should handle large sums', () => {
      const result = BigDecimalCalculator.add('999999.99', '0.01');
      expect(result).toBe('1000000.00');
    });

    it('should handle multiple small values', () => {
      let sum = '0.00';
      sum = BigDecimalCalculator.add(sum, '0.01');
      sum = BigDecimalCalculator.add(sum, '0.01');
      sum = BigDecimalCalculator.add(sum, '0.01');
      expect(sum).toBe('0.03');
    });
  });

  describe('generateCalculationFormula', () => {
    it('should generate human-readable formula', () => {
      const formula = BigDecimalCalculator.generateCalculationFormula(
        '2500.00',
        '18.990',
        '39.56',
      );

      expect(formula).toContain('2500.00');
      expect(formula).toContain('18.990');
      expect(formula).toContain('1200');
      expect(formula).toContain('39.56');
      expect(formula).toContain('HALF_UP');
    });

    it('should include raw calculation before rounding', () => {
      const formula = BigDecimalCalculator.generateCalculationFormula(
        '2500.00',
        '18.990',
        '39.56',
      );

      // Should show intermediate calculation
      expect(formula).toMatch(/\d+\.\d{4}/); // Raw value with more precision
    });

    it('should show formula structure', () => {
      const formula = BigDecimalCalculator.generateCalculationFormula(
        '500.00',
        '24.990',
        '10.41',
      );

      expect(formula).toMatch(/\(.+\s×\s.+\)\s\/\s1200/);
    });

    it('should indicate rounding method', () => {
      const formula = BigDecimalCalculator.generateCalculationFormula(
        '100.00',
        '18.990',
        '1.58',
      );

      expect(formula).toContain('HALF_UP');
    });

    it('should show arrow to final result', () => {
      const formula = BigDecimalCalculator.generateCalculationFormula(
        '1000.00',
        '12.000',
        '10.00',
      );

      expect(formula).toContain('→');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid balance', () => {
      expect(() => BigDecimalCalculator.calculateInterest('invalid', '18.990')).toThrow();
    });

    it('should throw error for invalid rate', () => {
      expect(() => BigDecimalCalculator.calculateInterest('100.00', 'invalid')).toThrow();
    });

    it('should throw error for empty balance', () => {
      expect(() => BigDecimalCalculator.calculateInterest('', '18.990')).toThrow();
    });

    it('should throw error for empty rate', () => {
      expect(() => BigDecimalCalculator.calculateInterest('100.00', '')).toThrow();
    });

    it('should throw error for NaN balance in add', () => {
      expect(() => BigDecimalCalculator.add('invalid', '10.00')).toThrow();
    });

    it('should throw error for NaN value in add', () => {
      expect(() => BigDecimalCalculator.add('10.00', 'invalid')).toThrow();
    });
  });

  describe('precision and accuracy', () => {
    it('should maintain precision for financial calculations', () => {
      const result = BigDecimalCalculator.calculateInterest('1234.56', '18.990');
      expect(result).toMatch(/^\d+\.\d{2}$/);
    });

    it('should not lose precision with repeated operations', () => {
      let sum = '0.00';
      for (let i = 0; i < 100; i++) {
        sum = BigDecimalCalculator.add(sum, '0.01');
      }
      expect(sum).toBe('1.00');
    });

    it('should handle maximum DECIMAL(15,2) values', () => {
      const result = BigDecimalCalculator.calculateInterest('9999999999999.99', '1.000');
      // (9999999999999.99 * 1) / 1200 = 8333333333.33
      expect(result).toBe('8333333333.33');
    });
  });
});
