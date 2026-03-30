import {
  TransactionType,
  TransactionSource,
  TransactionTypeNames,
} from '../../../src/models/transaction.model';

describe('Transaction Models', () => {
  describe('TransactionType', () => {
    it('should define all transaction types', () => {
      expect(TransactionType.PURCHASE).toBe('01');
      expect(TransactionType.PAYMENT).toBe('02');
      expect(TransactionType.CASH_ADVANCE).toBe('03');
      expect(TransactionType.FEE).toBe('04');
      expect(TransactionType.INTEREST).toBe('05');
      expect(TransactionType.ADJUSTMENT).toBe('06');
    });
  });

  describe('TransactionSource', () => {
    it('should define all transaction sources', () => {
      expect(TransactionSource.POS).toBe('POS');
      expect(TransactionSource.ONLINE).toBe('online');
      expect(TransactionSource.ATM).toBe('ATM');
    });
  });

  describe('TransactionTypeNames', () => {
    it('should map PURCHASE correctly', () => {
      expect(TransactionTypeNames[TransactionType.PURCHASE]).toBe('purchase');
    });

    it('should map PAYMENT correctly', () => {
      expect(TransactionTypeNames[TransactionType.PAYMENT]).toBe('payment');
    });

    it('should map CASH_ADVANCE correctly', () => {
      expect(TransactionTypeNames[TransactionType.CASH_ADVANCE]).toBe('cash_advance');
    });

    it('should map FEE correctly', () => {
      expect(TransactionTypeNames[TransactionType.FEE]).toBe('fee');
    });

    it('should map INTEREST correctly', () => {
      expect(TransactionTypeNames[TransactionType.INTEREST]).toBe('interest');
    });

    it('should map ADJUSTMENT correctly', () => {
      expect(TransactionTypeNames[TransactionType.ADJUSTMENT]).toBe('adjustment');
    });

    it('should have mapping for all transaction types', () => {
      const types = Object.values(TransactionType);
      types.forEach((type) => {
        expect(TransactionTypeNames[type]).toBeDefined();
      });
    });
  });
});
