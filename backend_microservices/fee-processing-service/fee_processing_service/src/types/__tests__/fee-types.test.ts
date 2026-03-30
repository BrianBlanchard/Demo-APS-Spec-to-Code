import { FeeType, FeeTypeDescriptions, TRANSACTION_TYPE_FEE } from '../fee-types';

describe('FeeType', () => {
  describe('Enum Values', () => {
    it('should have LATE_PAYMENT value', () => {
      expect(FeeType.LATE_PAYMENT).toBe('late_payment');
    });

    it('should have ANNUAL_FEE value', () => {
      expect(FeeType.ANNUAL_FEE).toBe('annual_fee');
    });

    it('should have OVER_LIMIT value', () => {
      expect(FeeType.OVER_LIMIT).toBe('over_limit');
    });

    it('should have CASH_ADVANCE value', () => {
      expect(FeeType.CASH_ADVANCE).toBe('cash_advance');
    });

    it('should have RETURNED_PAYMENT value', () => {
      expect(FeeType.RETURNED_PAYMENT).toBe('returned_payment');
    });

    it('should have exactly 5 fee types', () => {
      const feeTypeKeys = Object.keys(FeeType);
      expect(feeTypeKeys.length).toBe(5);
    });
  });

  describe('FeeTypeDescriptions', () => {
    it('should have description for LATE_PAYMENT', () => {
      expect(FeeTypeDescriptions[FeeType.LATE_PAYMENT]).toBe('Late payment fee');
    });

    it('should have description for ANNUAL_FEE', () => {
      expect(FeeTypeDescriptions[FeeType.ANNUAL_FEE]).toBe('Annual account fee');
    });

    it('should have description for OVER_LIMIT', () => {
      expect(FeeTypeDescriptions[FeeType.OVER_LIMIT]).toBe('Over credit limit fee');
    });

    it('should have description for CASH_ADVANCE', () => {
      expect(FeeTypeDescriptions[FeeType.CASH_ADVANCE]).toBe('Cash advance fee');
    });

    it('should have description for RETURNED_PAYMENT', () => {
      expect(FeeTypeDescriptions[FeeType.RETURNED_PAYMENT]).toBe('Returned payment fee');
    });

    it('should have descriptions for all fee types', () => {
      const feeTypeValues = Object.values(FeeType);
      feeTypeValues.forEach((feeType) => {
        expect(FeeTypeDescriptions[feeType]).toBeDefined();
        expect(FeeTypeDescriptions[feeType]).not.toBe('');
      });
    });
  });

  describe('TRANSACTION_TYPE_FEE', () => {
    it('should have value "04"', () => {
      expect(TRANSACTION_TYPE_FEE).toBe('04');
    });

    it('should be a string', () => {
      expect(typeof TRANSACTION_TYPE_FEE).toBe('string');
    });
  });
});
