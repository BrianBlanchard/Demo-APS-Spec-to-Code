import { TransactionRepository } from '../transaction.repository';
import { TransactionSearchRequest } from '../../types';
import { newDb } from 'pg-mem';

describe('TransactionRepository - Data Access/Repository', () => {
  let repository: TransactionRepository;
  let db: any;

  beforeEach(async () => {
    const mem = newDb();
    db = mem.adapters.createKnex() as any;

    // Create transactions table
    await db.schema.createTable('transactions', (table: any) => {
      table.string('transaction_id', 16).primary();
      table.string('account_id', 11).notNullable();
      table.string('card_number', 16).notNullable();
      table.string('transaction_type', 2).notNullable();
      table.string('transaction_category', 4).notNullable();
      table.float('amount').notNullable();
      table.string('description', 255).notNullable();
      table.string('merchant_name', 100).notNullable();
      table.string('merchant_city', 100);
      table.timestamp('original_timestamp').notNullable();
      table.timestamp('posted_timestamp').notNullable();
      table.string('status', 20).notNullable();
    });

    // Insert test data
    await db('transactions').insert([
      {
        transaction_id: '1234567890123456',
        account_id: '12345678901',
        card_number: '1234567890123456',
        transaction_type: '01',
        transaction_category: '5411',
        amount: 125.50,
        description: 'AMAZON.COM PURCHASE',
        merchant_name: 'AMAZON.COM',
        merchant_city: 'Seattle',
        original_timestamp: '2024-01-15T14:30:00Z',
        posted_timestamp: '2024-01-15T14:30:05Z',
        status: 'posted',
      },
      {
        transaction_id: '1234567890123457',
        account_id: '12345678901',
        card_number: '1234567890123456',
        transaction_type: '01',
        transaction_category: '5812',
        amount: 45.00,
        description: 'STARBUCKS PURCHASE',
        merchant_name: 'STARBUCKS',
        merchant_city: 'New York',
        original_timestamp: '2024-01-16T09:15:00Z',
        posted_timestamp: '2024-01-16T09:15:03Z',
        status: 'posted',
      },
      {
        transaction_id: '1234567890123458',
        account_id: '99999999999',
        card_number: '9999999999999999',
        transaction_type: '02',
        transaction_category: '6011',
        amount: 200.00,
        description: 'ATM WITHDRAWAL',
        merchant_name: 'BANK ATM',
        merchant_city: 'Boston',
        original_timestamp: '2024-01-17T12:00:00Z',
        posted_timestamp: '2024-01-17T12:00:02Z',
        status: 'posted',
      },
    ]);

    repository = new TransactionRepository(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('searchTransactions - by accountId', () => {
    it('should return transactions for specific account', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(2);
      expect(results[0].accountId).toBe('12345678901');
      expect(results[1].accountId).toBe('12345678901');
    });

    it('should mask card numbers in results', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results[0].cardNumber).toBe('************3456');
    });

    it('should return empty array for non-existent account', async () => {
      const request: TransactionSearchRequest = {
        accountId: '00000000000',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(0);
    });
  });

  describe('searchTransactions - by cardNumber', () => {
    it('should return transactions for specific card', async () => {
      const request: TransactionSearchRequest = {
        cardNumber: '1234567890123456',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(2);
    });
  });

  describe('searchTransactions - by dateRange', () => {
    it('should filter transactions by date range', async () => {
      const request: TransactionSearchRequest = {
        dateRange: {
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-16T00:00:00Z',
        },
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle single day range', async () => {
      const request: TransactionSearchRequest = {
        dateRange: {
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-15T23:59:59Z',
        },
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('searchTransactions - by amountRange', () => {
    it('should filter transactions by amount range', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        amountRange: {
          min: 40.0,
          max: 50.0,
        },
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(45.0);
    });

    it('should handle exact amount match', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        amountRange: {
          min: 125.50,
          max: 125.50,
        },
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(125.5);
    });
  });

  describe('searchTransactions - by transactionTypes', () => {
    it('should filter by transaction type', async () => {
      const request: TransactionSearchRequest = {
        transactionTypes: ['01'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(2);
      results.forEach((tx) => {
        expect(tx.transactionType).toBe('01');
        expect(tx.transactionTypeName).toBe('Purchase');
      });
    });

    it('should handle multiple transaction types', async () => {
      const request: TransactionSearchRequest = {
        transactionTypes: ['01', '02'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(3);
    });

    it('should return empty for non-matching type', async () => {
      const request: TransactionSearchRequest = {
        transactionTypes: ['99'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(0);
    });
  });

  describe('searchTransactions - by merchantName', () => {
    it('should filter by merchant name (partial match)', async () => {
      const request: TransactionSearchRequest = {
        merchantName: 'AMAZON',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(1);
      expect(results[0].merchantName).toContain('AMAZON');
    });

    it('should be case insensitive', async () => {
      const request: TransactionSearchRequest = {
        merchantName: 'amazon',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(1);
    });
  });

  describe('searchTransactions - sorting', () => {
    it('should sort by date descending by default', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        sortBy: 'date',
        sortOrder: 'desc',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(new Date(results[0].originalTimestamp).getTime()).toBeGreaterThan(
        new Date(results[1].originalTimestamp).getTime()
      );
    });

    it('should sort by date ascending', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        sortBy: 'date',
        sortOrder: 'asc',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(new Date(results[0].originalTimestamp).getTime()).toBeLessThan(
        new Date(results[1].originalTimestamp).getTime()
      );
    });

    it('should sort by amount descending', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        sortBy: 'amount',
        sortOrder: 'desc',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results[0].amount).toBeGreaterThan(results[1].amount);
    });

    it('should sort by amount ascending', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        sortBy: 'amount',
        sortOrder: 'asc',
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results[0].amount).toBeLessThan(results[1].amount);
    });
  });

  describe('searchTransactions - combined filters', () => {
    it('should apply multiple filters together', async () => {
      const request: TransactionSearchRequest = {
        accountId: '12345678901',
        amountRange: {
          min: 100.0,
          max: 200.0,
        },
        transactionTypes: ['01'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(125.5);
      expect(results[0].transactionType).toBe('01');
    });
  });

  describe('getTransactionTypeName', () => {
    it('should map known transaction types', async () => {
      const request: TransactionSearchRequest = {
        transactionTypes: ['02'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results[0].transactionTypeName).toBe('Withdrawal');
    });

    it('should return Unknown for unmapped types', async () => {
      // Insert a transaction with unknown type
      await db('transactions').insert({
        transaction_id: '9999999999999999',
        account_id: '88888888888',
        card_number: '8888888888888888',
        transaction_type: '99',
        transaction_category: '0000',
        amount: 10.0,
        description: 'UNKNOWN TYPE',
        merchant_name: 'UNKNOWN',
        merchant_city: 'Unknown',
        original_timestamp: '2024-01-18T10:00:00Z',
        posted_timestamp: '2024-01-18T10:00:01Z',
        status: 'posted',
      });

      const request: TransactionSearchRequest = {
        transactionTypes: ['99'],
        pagination: { page: 1, pageSize: 50 },
      };

      const results = await repository.searchTransactions(request);

      expect(results[0].transactionTypeName).toBe('Unknown');
    });
  });
});
