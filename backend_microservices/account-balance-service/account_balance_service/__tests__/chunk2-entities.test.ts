import { TransactionType } from '../src/types/account.types';
import type { AccountBalance, AccountBalanceEntity, BalanceHistoryEntity } from '../src/types/account.types';

describe('Chunk 2: Entities / Domain Models', () => {
  describe('AccountBalance Interface', () => {
    it('should create valid AccountBalance object with all required fields', () => {
      const balance: AccountBalance = {
        accountId: '12345678901',
        currentBalance: 2450.75,
        creditLimit: 5000.00,
        availableCredit: 2549.25,
        cashCreditLimit: 1500.00,
        availableCashCredit: 800.00,
        currentCycleCredit: 350.00,
        currentCycleDebit: 2800.75,
        cycleStartDate: '2024-01-01',
        cycleEndDate: '2024-01-31',
        lastTransactionDate: '2024-01-15T14:30:00Z',
        lastUpdatedAt: '2024-01-15T14:30:15Z',
      };

      expect(balance.accountId).toBe('12345678901');
      expect(balance.currentBalance).toBe(2450.75);
      expect(balance.creditLimit).toBe(5000.00);
      expect(balance.availableCredit).toBe(2549.25);
    });

    it('should handle zero balance correctly', () => {
      const balance: AccountBalance = {
        accountId: '12345678901',
        currentBalance: 0,
        creditLimit: 5000.00,
        availableCredit: 5000.00,
        cashCreditLimit: 1500.00,
        availableCashCredit: 1500.00,
        currentCycleCredit: 0,
        currentCycleDebit: 0,
        cycleStartDate: '2024-01-01',
        cycleEndDate: '2024-01-31',
        lastTransactionDate: '2024-01-01T00:00:00Z',
        lastUpdatedAt: '2024-01-01T00:00:00Z',
      };

      expect(balance.currentBalance).toBe(0);
      expect(balance.availableCredit).toBe(balance.creditLimit);
    });

    it('should handle credit balance (negative balance)', () => {
      const balance: AccountBalance = {
        accountId: '12345678901',
        currentBalance: -150.00,
        creditLimit: 5000.00,
        availableCredit: 5150.00,
        cashCreditLimit: 1500.00,
        availableCashCredit: 1650.00,
        currentCycleCredit: 500.00,
        currentCycleDebit: 350.00,
        cycleStartDate: '2024-01-01',
        cycleEndDate: '2024-01-31',
        lastTransactionDate: '2024-01-15T14:30:00Z',
        lastUpdatedAt: '2024-01-15T14:30:15Z',
      };

      expect(balance.currentBalance).toBeLessThan(0);
      expect(balance.availableCredit).toBeGreaterThan(balance.creditLimit);
    });

    it('should store date fields as ISO strings', () => {
      const balance: AccountBalance = {
        accountId: '12345678901',
        currentBalance: 2450.75,
        creditLimit: 5000.00,
        availableCredit: 2549.25,
        cashCreditLimit: 1500.00,
        availableCashCredit: 800.00,
        currentCycleCredit: 350.00,
        currentCycleDebit: 2800.75,
        cycleStartDate: '2024-01-01',
        cycleEndDate: '2024-01-31',
        lastTransactionDate: '2024-01-15T14:30:00Z',
        lastUpdatedAt: '2024-01-15T14:30:15Z',
      };

      expect(balance.cycleStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(balance.lastTransactionDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });

  describe('AccountBalanceEntity Interface', () => {
    it('should create valid AccountBalanceEntity with all required fields', () => {
      const entity: AccountBalanceEntity = {
        account_id: '12345678901',
        current_balance: 2450.75,
        credit_limit: 5000.00,
        cash_credit_limit: 1500.00,
        current_cycle_credit: 350.00,
        current_cycle_debit: 2800.75,
        cycle_start_date: new Date('2024-01-01'),
        cycle_end_date: new Date('2024-01-31'),
        last_transaction_date: new Date('2024-01-15T14:30:00Z'),
        updated_at: new Date('2024-01-15T14:30:15Z'),
        version: 1,
      };

      expect(entity.account_id).toBe('12345678901');
      expect(entity.version).toBe(1);
      expect(entity.cycle_start_date).toBeInstanceOf(Date);
    });

    it('should handle version increments', () => {
      const entity: AccountBalanceEntity = {
        account_id: '12345678901',
        current_balance: 2450.75,
        credit_limit: 5000.00,
        cash_credit_limit: 1500.00,
        current_cycle_credit: 350.00,
        current_cycle_debit: 2800.75,
        cycle_start_date: new Date('2024-01-01'),
        cycle_end_date: new Date('2024-01-31'),
        last_transaction_date: new Date(),
        updated_at: new Date(),
        version: 5,
      };

      expect(entity.version).toBe(5);
      expect(typeof entity.version).toBe('number');
    });

    it('should use snake_case for database fields', () => {
      const entity: AccountBalanceEntity = {
        account_id: '12345678901',
        current_balance: 2450.75,
        credit_limit: 5000.00,
        cash_credit_limit: 1500.00,
        current_cycle_credit: 350.00,
        current_cycle_debit: 2800.75,
        cycle_start_date: new Date(),
        cycle_end_date: new Date(),
        last_transaction_date: new Date(),
        updated_at: new Date(),
        version: 1,
      };

      const keys = Object.keys(entity);
      keys.forEach((key) => {
        expect(key).toMatch(/^[a-z_]+$/);
      });
    });

    it('should store Date objects for timestamp fields', () => {
      const now = new Date();
      const entity: AccountBalanceEntity = {
        account_id: '12345678901',
        current_balance: 2450.75,
        credit_limit: 5000.00,
        cash_credit_limit: 1500.00,
        current_cycle_credit: 350.00,
        current_cycle_debit: 2800.75,
        cycle_start_date: now,
        cycle_end_date: now,
        last_transaction_date: now,
        updated_at: now,
        version: 1,
      };

      expect(entity.last_transaction_date).toBeInstanceOf(Date);
      expect(entity.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('BalanceHistoryEntity Interface', () => {
    it('should create valid BalanceHistoryEntity with all required fields', () => {
      const history: BalanceHistoryEntity = {
        history_id: '550e8400-e29b-41d4-a716-446655440000',
        account_id: '12345678901',
        transaction_id: '1234567890123456',
        previous_balance: 2325.25,
        new_balance: 2450.75,
        amount: 125.50,
        transaction_type: 'purchase',
        recorded_at: new Date('2024-01-15T14:30:15Z'),
      };

      expect(history.history_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(history.account_id).toBe('12345678901');
      expect(history.transaction_id).toBe('1234567890123456');
    });

    it('should record balance increase for debit transactions', () => {
      const history: BalanceHistoryEntity = {
        history_id: '550e8400-e29b-41d4-a716-446655440000',
        account_id: '12345678901',
        transaction_id: '1234567890123456',
        previous_balance: 2000.00,
        new_balance: 2125.50,
        amount: 125.50,
        transaction_type: 'purchase',
        recorded_at: new Date(),
      };

      const balanceIncrease = history.new_balance - history.previous_balance;
      expect(balanceIncrease).toBe(history.amount);
    });

    it('should record balance decrease for credit transactions', () => {
      const history: BalanceHistoryEntity = {
        history_id: '550e8400-e29b-41d4-a716-446655440000',
        account_id: '12345678901',
        transaction_id: '1234567890123456',
        previous_balance: 2000.00,
        new_balance: 1500.00,
        amount: 500.00,
        transaction_type: 'payment',
        recorded_at: new Date(),
      };

      const balanceDecrease = history.previous_balance - history.new_balance;
      expect(balanceDecrease).toBe(history.amount);
    });

    it('should handle all transaction types', () => {
      const types: string[] = [
        TransactionType.PURCHASE,
        TransactionType.PAYMENT,
        TransactionType.CASH_ADVANCE,
        TransactionType.REFUND,
        TransactionType.FEE,
        TransactionType.INTEREST,
      ];

      types.forEach((type) => {
        const history: BalanceHistoryEntity = {
          history_id: '550e8400-e29b-41d4-a716-446655440000',
          account_id: '12345678901',
          transaction_id: '1234567890123456',
          previous_balance: 2000.00,
          new_balance: 2100.00,
          amount: 100.00,
          transaction_type: type,
          recorded_at: new Date(),
        };

        expect(history.transaction_type).toBe(type);
      });
    });

    it('should use UUID format for history_id', () => {
      const history: BalanceHistoryEntity = {
        history_id: '550e8400-e29b-41d4-a716-446655440000',
        account_id: '12345678901',
        transaction_id: '1234567890123456',
        previous_balance: 2000.00,
        new_balance: 2100.00,
        amount: 100.00,
        transaction_type: 'purchase',
        recorded_at: new Date(),
      };

      expect(history.history_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should maintain audit trail with recorded_at timestamp', () => {
      const timestamp = new Date();
      const history: BalanceHistoryEntity = {
        history_id: '550e8400-e29b-41d4-a716-446655440000',
        account_id: '12345678901',
        transaction_id: '1234567890123456',
        previous_balance: 2000.00,
        new_balance: 2100.00,
        amount: 100.00,
        transaction_type: 'purchase',
        recorded_at: timestamp,
      };

      expect(history.recorded_at).toBeInstanceOf(Date);
      expect(history.recorded_at.getTime()).toBe(timestamp.getTime());
    });
  });
});
