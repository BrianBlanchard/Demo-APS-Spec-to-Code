import { ReplacementReason, CardStatus, ShippingMethod } from '../../src/types/enums';

describe('Enums', () => {
  describe('ReplacementReason', () => {
    it('should have correct values', () => {
      expect(ReplacementReason.LOST_OR_STOLEN).toBe('lost_or_stolen');
      expect(ReplacementReason.DAMAGED).toBe('damaged');
      expect(ReplacementReason.EXPIRING_SOON).toBe('expiring_soon');
      expect(ReplacementReason.FRAUD_PREVENTION).toBe('fraud_prevention');
    });

    it('should have exactly 4 values', () => {
      const values = Object.values(ReplacementReason);
      expect(values).toHaveLength(4);
    });

    it('should contain only expected values', () => {
      const values = Object.values(ReplacementReason);
      expect(values).toEqual(
        expect.arrayContaining([
          'lost_or_stolen',
          'damaged',
          'expiring_soon',
          'fraud_prevention',
        ]),
      );
    });
  });

  describe('CardStatus', () => {
    it('should have correct values', () => {
      expect(CardStatus.ACTIVE).toBe('active');
      expect(CardStatus.INACTIVE).toBe('inactive');
      expect(CardStatus.SUSPENDED).toBe('suspended');
      expect(CardStatus.REPLACED).toBe('replaced');
    });

    it('should have exactly 4 values', () => {
      const values = Object.values(CardStatus);
      expect(values).toHaveLength(4);
    });

    it('should contain only expected values', () => {
      const values = Object.values(CardStatus);
      expect(values).toEqual(
        expect.arrayContaining(['active', 'inactive', 'suspended', 'replaced']),
      );
    });
  });

  describe('ShippingMethod', () => {
    it('should have correct values', () => {
      expect(ShippingMethod.STANDARD).toBe('standard');
      expect(ShippingMethod.EXPEDITED).toBe('expedited');
    });

    it('should have exactly 2 values', () => {
      const values = Object.values(ShippingMethod);
      expect(values).toHaveLength(2);
    });

    it('should contain only expected values', () => {
      const values = Object.values(ShippingMethod);
      expect(values).toEqual(expect.arrayContaining(['standard', 'expedited']));
    });
  });
});
