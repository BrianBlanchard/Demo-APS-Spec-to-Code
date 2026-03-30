import {
  TransactionStatus,
  TransactionType,
  AccountStatus,
  ValidationStatus,
} from '../transaction.model';

describe('Transaction Model Enums', () => {
  describe('TransactionStatus', () => {
    it('should have POSTED status', () => {
      expect(TransactionStatus.POSTED).toBe('posted');
    });

    it('should have REVERSED status', () => {
      expect(TransactionStatus.REVERSED).toBe('reversed');
    });

    it('should have ADJUSTED status', () => {
      expect(TransactionStatus.ADJUSTED).toBe('adjusted');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(TransactionStatus);
      expect(statuses).toHaveLength(3);
    });
  });

  describe('TransactionType', () => {
    it('should have DEBIT_PURCHASE type', () => {
      expect(TransactionType.DEBIT_PURCHASE).toBe('01');
    });

    it('should have CREDIT_PAYMENT type', () => {
      expect(TransactionType.CREDIT_PAYMENT).toBe('02');
    });

    it('should have DEBIT_CASH_ADVANCE type', () => {
      expect(TransactionType.DEBIT_CASH_ADVANCE).toBe('03');
    });

    it('should have DEBIT_FEE type', () => {
      expect(TransactionType.DEBIT_FEE).toBe('04');
    });

    it('should have DEBIT_INTEREST type', () => {
      expect(TransactionType.DEBIT_INTEREST).toBe('05');
    });

    it('should have ADJUSTMENT type', () => {
      expect(TransactionType.ADJUSTMENT).toBe('06');
    });

    it('should have exactly 6 transaction types', () => {
      const types = Object.values(TransactionType);
      expect(types).toHaveLength(6);
    });

    it('should identify debit types correctly', () => {
      const debitTypes = [
        TransactionType.DEBIT_PURCHASE,
        TransactionType.DEBIT_CASH_ADVANCE,
        TransactionType.DEBIT_FEE,
        TransactionType.DEBIT_INTEREST,
      ];
      debitTypes.forEach((type) => {
        expect(['01', '03', '04', '05']).toContain(type);
      });
    });

    it('should identify credit type correctly', () => {
      expect(TransactionType.CREDIT_PAYMENT).toBe('02');
    });
  });

  describe('AccountStatus', () => {
    it('should have ACTIVE status', () => {
      expect(AccountStatus.ACTIVE).toBe('active');
    });

    it('should have SUSPENDED status', () => {
      expect(AccountStatus.SUSPENDED).toBe('suspended');
    });

    it('should have CLOSED status', () => {
      expect(AccountStatus.CLOSED).toBe('closed');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toHaveLength(3);
    });
  });

  describe('ValidationStatus', () => {
    it('should have APPROVED status', () => {
      expect(ValidationStatus.APPROVED).toBe('approved');
    });

    it('should have DECLINED status', () => {
      expect(ValidationStatus.DECLINED).toBe('declined');
    });

    it('should have PENDING status', () => {
      expect(ValidationStatus.PENDING).toBe('pending');
    });

    it('should have exactly 3 statuses', () => {
      const statuses = Object.values(ValidationStatus);
      expect(statuses).toHaveLength(3);
    });
  });
});
