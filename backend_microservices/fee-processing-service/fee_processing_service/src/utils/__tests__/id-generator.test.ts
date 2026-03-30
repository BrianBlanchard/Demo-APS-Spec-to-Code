import { generateTransactionId } from '../id-generator';

describe('ID Generator', () => {
  describe('generateTransactionId', () => {
    it('should generate a 16-digit transaction ID', () => {
      const transactionId = generateTransactionId();

      expect(transactionId).toHaveLength(16);
      expect(/^\d{16}$/.test(transactionId)).toBe(true);
    });

    it('should generate numeric-only transaction IDs', () => {
      const transactionId = generateTransactionId();

      expect(transactionId).toMatch(/^\d+$/);
      expect(Number.isNaN(Number(transactionId))).toBe(false);
    });

    it('should generate unique transaction IDs on consecutive calls', () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();

      expect(id1).not.toBe(id2);
    });

    it('should generate multiple unique IDs', () => {
      const ids = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateTransactionId());
      }

      expect(ids.size).toBe(iterations);
    });

    it('should generate IDs without leading zeros issue', () => {
      const transactionId = generateTransactionId();

      expect(transactionId).toHaveLength(16);
      expect(transactionId[0]).toMatch(/\d/);
    });

    it('should generate consistent length IDs across multiple calls', () => {
      for (let i = 0; i < 50; i++) {
        const transactionId = generateTransactionId();
        expect(transactionId).toHaveLength(16);
      }
    });

    it('should return string type', () => {
      const transactionId = generateTransactionId();

      expect(typeof transactionId).toBe('string');
    });

    it('should not contain special characters', () => {
      const transactionId = generateTransactionId();

      expect(transactionId).not.toMatch(/[^0-9]/);
    });

    it('should not contain whitespace', () => {
      const transactionId = generateTransactionId();

      expect(transactionId).not.toMatch(/\s/);
    });

    it('should be parseable as a number', () => {
      const transactionId = generateTransactionId();
      const parsed = Number(transactionId);

      expect(Number.isFinite(parsed)).toBe(true);
      expect(parsed).toBeGreaterThan(0);
    });
  });
});
