import { Account } from '../account.entity';

describe('Account Entity', () => {
  describe('Type Structure', () => {
    it('should allow valid account object', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-15T00:00:00.000Z'),
      };

      expect(account.accountId).toBe('12345678901');
      expect(account.balance).toBe(1000.0);
      expect(account.creditLimit).toBe(5000.0);
      expect(account.status).toBe('active');
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow account with zero balance', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.balance).toBe(0);
    });

    it('should allow account with negative balance', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: -500.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.balance).toBe(-500.0);
    });

    it('should allow account with zero credit limit', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.creditLimit).toBe(0);
    });

    it('should allow different status values', () => {
      const statuses = ['active', 'suspended', 'closed', 'pending'];

      statuses.forEach((status) => {
        const account: Account = {
          accountId: '12345678901',
          balance: 0,
          creditLimit: 5000.0,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(account.status).toBe(status);
      });
    });

    it('should preserve Date object types for timestamps', () => {
      const now = new Date();
      const account: Account = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      expect(account.createdAt).toBe(now);
      expect(account.updatedAt).toBe(now);
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow updatedAt to be different from createdAt', () => {
      const created = new Date('2024-01-01T00:00:00.000Z');
      const updated = new Date('2024-01-15T00:00:00.000Z');

      const account: Account = {
        accountId: '12345678901',
        balance: 1000.0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: created,
        updatedAt: updated,
      };

      expect(account.createdAt.getTime()).toBeLessThan(account.updatedAt.getTime());
    });
  });

  describe('Field Types', () => {
    it('should have accountId as string', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof account.accountId).toBe('string');
    });

    it('should have balance as number', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 1000.5,
        creditLimit: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof account.balance).toBe('number');
    });

    it('should have creditLimit as number', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 5000.0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof account.creditLimit).toBe('number');
    });

    it('should have status as string', () => {
      const account: Account = {
        accountId: '12345678901',
        balance: 0,
        creditLimit: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof account.status).toBe('string');
    });
  });
});
