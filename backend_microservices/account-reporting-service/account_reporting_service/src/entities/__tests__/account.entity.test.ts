import { AccountEntity, AccountSummary } from '../account.entity';
import { AccountStatus } from '../../types/report.types';

describe('account.entity', () => {
  describe('AccountEntity', () => {
    it('should create a valid account entity with all required fields', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174000',
        status: AccountStatus.ACTIVE,
        balance: 5000.50,
        creditLimit: 10000.00,
        lastActivityDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      expect(account.accountId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(account.status).toBe(AccountStatus.ACTIVE);
      expect(account.balance).toBe(5000.50);
      expect(account.creditLimit).toBe(10000.00);
      expect(account.lastActivityDate).toEqual(new Date('2024-01-15'));
      expect(account.createdAt).toEqual(new Date('2024-01-01'));
      expect(account.updatedAt).toEqual(new Date('2024-01-15'));
    });

    it('should create account with suspended status', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174001',
        status: AccountStatus.SUSPENDED,
        balance: 0,
        creditLimit: 5000.00,
        lastActivityDate: new Date('2024-01-10'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      };

      expect(account.status).toBe(AccountStatus.SUSPENDED);
    });

    it('should create account with closed status', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174002',
        status: AccountStatus.CLOSED,
        balance: 0,
        creditLimit: 0,
        lastActivityDate: new Date('2024-01-05'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-05'),
      };

      expect(account.status).toBe(AccountStatus.CLOSED);
      expect(account.balance).toBe(0);
      expect(account.creditLimit).toBe(0);
    });

    it('should support negative balance', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174003',
        status: AccountStatus.ACTIVE,
        balance: -100.50,
        creditLimit: 10000.00,
        lastActivityDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      expect(account.balance).toBe(-100.50);
    });

    it('should support zero balance and credit limit', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174004',
        status: AccountStatus.ACTIVE,
        balance: 0,
        creditLimit: 0,
        lastActivityDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      expect(account.balance).toBe(0);
      expect(account.creditLimit).toBe(0);
    });

    it('should support large balance values', () => {
      const account: AccountEntity = {
        accountId: '123e4567-e89b-12d3-a456-426614174005',
        status: AccountStatus.ACTIVE,
        balance: 999999999.99,
        creditLimit: 1000000000.00,
        lastActivityDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      expect(account.balance).toBe(999999999.99);
      expect(account.creditLimit).toBe(1000000000.00);
    });
  });

  describe('AccountSummary', () => {
    it('should create a valid account summary with all counts', () => {
      const summary: AccountSummary = {
        totalAccounts: 10000,
        activeAccounts: 9500,
        suspendedAccounts: 400,
        closedAccounts: 100,
      };

      expect(summary.totalAccounts).toBe(10000);
      expect(summary.activeAccounts).toBe(9500);
      expect(summary.suspendedAccounts).toBe(400);
      expect(summary.closedAccounts).toBe(100);
    });

    it('should create summary with zero counts', () => {
      const summary: AccountSummary = {
        totalAccounts: 0,
        activeAccounts: 0,
        suspendedAccounts: 0,
        closedAccounts: 0,
      };

      expect(summary.totalAccounts).toBe(0);
      expect(summary.activeAccounts).toBe(0);
      expect(summary.suspendedAccounts).toBe(0);
      expect(summary.closedAccounts).toBe(0);
    });

    it('should create summary with only active accounts', () => {
      const summary: AccountSummary = {
        totalAccounts: 1000,
        activeAccounts: 1000,
        suspendedAccounts: 0,
        closedAccounts: 0,
      };

      expect(summary.totalAccounts).toBe(1000);
      expect(summary.activeAccounts).toBe(1000);
    });

    it('should create summary where total equals sum of statuses', () => {
      const summary: AccountSummary = {
        totalAccounts: 100,
        activeAccounts: 60,
        suspendedAccounts: 30,
        closedAccounts: 10,
      };

      const sum = summary.activeAccounts + summary.suspendedAccounts + summary.closedAccounts;
      expect(sum).toBe(summary.totalAccounts);
    });

    it('should support large account counts', () => {
      const summary: AccountSummary = {
        totalAccounts: 10000000,
        activeAccounts: 9500000,
        suspendedAccounts: 400000,
        closedAccounts: 100000,
      };

      expect(summary.totalAccounts).toBe(10000000);
      expect(summary.activeAccounts).toBe(9500000);
    });
  });
});
