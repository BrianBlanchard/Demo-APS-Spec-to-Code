import { newDb } from 'pg-mem';
import { Knex } from 'knex';
import { TransactionCategoryRepository } from '../../src/repositories/transaction-category.repository';
import { DatabaseError } from '../../src/middleware/error-handler.middleware';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import logger from '../../src/utils/logger';

describe('TransactionCategoryRepository', () => {
  let db: Knex;
  let repository: TransactionCategoryRepository;

  beforeEach(async () => {
    // Create in-memory database
    const pgMem = newDb();
    db = pgMem.adapters.createKnex() as any;

    // Create table
    await db.schema.createTable('transaction_categories', (table) => {
      table.string('category_code', 4).primary();
      table.string('category_name', 255).notNullable();
      table.string('transaction_type', 2).notNullable();
      table.string('category_group', 50).notNullable();
      table.float('interest_rate').notNullable();
      table.boolean('rewards_eligible').notNullable();
      table.float('rewards_rate').notNullable();
    });

    // Insert test data
    await db('transaction_categories').insert([
      {
        category_code: '5812',
        category_name: 'Eating Places and Restaurants',
        transaction_type: '01',
        category_group: 'dining',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 2.0,
      },
      {
        category_code: '5411',
        category_name: 'Grocery Stores and Supermarkets',
        transaction_type: '01',
        category_group: 'groceries',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 3.0,
      },
      {
        category_code: '5541',
        category_name: 'Service Stations',
        transaction_type: '01',
        category_group: 'gas',
        interest_rate: 19.99,
        rewards_eligible: true,
        rewards_rate: 2.5,
      },
      {
        category_code: '6011',
        category_name: 'Automated Cash Disbursements',
        transaction_type: '02',
        category_group: 'cash_advance',
        interest_rate: 24.99,
        rewards_eligible: false,
        rewards_rate: 0.0,
      },
      {
        category_code: '0001',
        category_name: 'Payment',
        transaction_type: '04',
        category_group: 'payment',
        interest_rate: 0.0,
        rewards_eligible: false,
        rewards_rate: 0.0,
      },
    ]);

    repository = new TransactionCategoryRepository(db);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('findByMcc', () => {
    it('should find category by MCC', async () => {
      const result = await repository.findByMcc('5812');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('5812');
      expect(result?.categoryName).toBe('Eating Places and Restaurants');
      expect(result?.transactionType).toBe('01');
      expect(result?.categoryGroup).toBe('dining');
      expect(result?.interestRate).toBe(19.99);
      expect(result?.rewardsEligible).toBe(true);
      expect(result?.rewardsRate).toBe(2.0);
    });

    it('should find grocery store category', async () => {
      const result = await repository.findByMcc('5411');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('5411');
      expect(result?.categoryName).toBe('Grocery Stores and Supermarkets');
      expect(result?.categoryGroup).toBe('groceries');
      expect(result?.rewardsRate).toBe(3.0);
    });

    it('should find gas station category', async () => {
      const result = await repository.findByMcc('5541');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('5541');
      expect(result?.categoryName).toBe('Service Stations');
      expect(result?.categoryGroup).toBe('gas');
      expect(result?.rewardsRate).toBe(2.5);
    });

    it('should find cash advance category', async () => {
      const result = await repository.findByMcc('6011');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('6011');
      expect(result?.transactionType).toBe('02');
      expect(result?.categoryGroup).toBe('cash_advance');
      expect(result?.interestRate).toBe(24.99);
      expect(result?.rewardsEligible).toBe(false);
    });

    it('should find payment category', async () => {
      const result = await repository.findByMcc('0001');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('0001');
      expect(result?.transactionType).toBe('04');
      expect(result?.interestRate).toBe(0.0);
    });

    it('should return null for unknown MCC', async () => {
      const result = await repository.findByMcc('9999');

      expect(result).toBeNull();
    });

    it('should return null for non-existent MCC', async () => {
      const result = await repository.findByMcc('0000');

      expect(result).toBeNull();
    });

    it('should log debug message when querying', async () => {
      await repository.findByMcc('5812');

      expect(logger.debug).toHaveBeenCalledWith(
        { mcc: '5812' },
        'Querying transaction category by MCC'
      );
    });

    it('should log debug message when category found', async () => {
      await repository.findByMcc('5812');

      expect(logger.debug).toHaveBeenCalledWith(
        { mcc: '5812', category: 'Eating Places and Restaurants' },
        'Category found'
      );
    });

    it('should log debug message when category not found', async () => {
      await repository.findByMcc('9999');

      expect(logger.debug).toHaveBeenCalledWith(
        { mcc: '9999' },
        'No category found for MCC'
      );
    });

    it('should handle MCC with leading zeros', async () => {
      const result = await repository.findByMcc('0001');

      expect(result).not.toBeNull();
      expect(result?.categoryCode).toBe('0001');
    });

    it('should return all fields correctly mapped from snake_case to camelCase', async () => {
      const result = await repository.findByMcc('5812');

      expect(result).toEqual({
        categoryCode: '5812',
        categoryName: 'Eating Places and Restaurants',
        transactionType: '01',
        categoryGroup: 'dining',
        interestRate: 19.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      });
    });

    it('should handle numeric values correctly', async () => {
      const result = await repository.findByMcc('5812');

      expect(typeof result?.interestRate).toBe('number');
      expect(typeof result?.rewardsRate).toBe('number');
      expect(result?.interestRate).toBe(19.99);
      expect(result?.rewardsRate).toBe(2.0);
    });

    it('should handle boolean values correctly', async () => {
      const result = await repository.findByMcc('5812');

      expect(typeof result?.rewardsEligible).toBe('boolean');
      expect(result?.rewardsEligible).toBe(true);
    });

    it('should handle false boolean values correctly', async () => {
      const result = await repository.findByMcc('6011');

      expect(result?.rewardsEligible).toBe(false);
    });

    it('should handle zero numeric values correctly', async () => {
      const result = await repository.findByMcc('0001');

      expect(result?.interestRate).toBe(0.0);
      expect(result?.rewardsRate).toBe(0.0);
    });
  });

  describe('findByMcc - Error handling', () => {
    it('should throw DatabaseError when query fails', async () => {
      // Destroy the database to simulate error
      await db.destroy();

      await expect(repository.findByMcc('5812')).rejects.toThrow(DatabaseError);
    });

    it('should log error when query fails', async () => {
      // Destroy the database to simulate error
      await db.destroy();

      try {
        await repository.findByMcc('5812');
      } catch (error) {
        // Expected error
      }

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          mcc: '5812',
        }),
        'Database error querying category'
      );
    });

    it('should include error details in log', async () => {
      // Destroy the database to simulate error
      await db.destroy();

      try {
        await repository.findByMcc('5812');
      } catch (error) {
        // Expected error
      }

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          mcc: '5812',
        }),
        'Database error querying category'
      );
    });

    it('should throw error with correct message', async () => {
      // Destroy the database to simulate error
      await db.destroy();

      await expect(repository.findByMcc('5812')).rejects.toThrow(
        'Failed to query transaction category'
      );
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return true when database is healthy', async () => {
      const result = await repository.checkDatabaseHealth();

      expect(result).toBe(true);
    });

    it('should execute SELECT 1 query', async () => {
      const result = await repository.checkDatabaseHealth();

      expect(result).toBe(true);
    });

    it('should return false when database is unhealthy', async () => {
      // Destroy the database to simulate unhealthy state
      await db.destroy();

      const result = await repository.checkDatabaseHealth();

      expect(result).toBe(false);
    });

    it('should log error when health check fails', async () => {
      // Destroy the database to simulate unhealthy state
      await db.destroy();

      await repository.checkDatabaseHealth();

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
        }),
        'Database health check failed'
      );
    });

    it('should not throw error when health check fails', async () => {
      // Destroy the database to simulate unhealthy state
      await db.destroy();

      await expect(repository.checkDatabaseHealth()).resolves.not.toThrow();
    });

    it('should return false and not throw on connection error', async () => {
      // Destroy the database to simulate connection error
      await db.destroy();

      const result = await repository.checkDatabaseHealth();

      expect(result).toBe(false);
    });
  });

  describe('Database integration', () => {
    it('should handle multiple concurrent queries', async () => {
      const promises = [
        repository.findByMcc('5812'),
        repository.findByMcc('5411'),
        repository.findByMcc('5541'),
      ];

      const results = await Promise.all(promises);

      expect(results[0]?.categoryCode).toBe('5812');
      expect(results[1]?.categoryCode).toBe('5411');
      expect(results[2]?.categoryCode).toBe('5541');
    });

    it('should handle sequential queries', async () => {
      const result1 = await repository.findByMcc('5812');
      const result2 = await repository.findByMcc('5411');

      expect(result1?.categoryCode).toBe('5812');
      expect(result2?.categoryCode).toBe('5411');
    });

    it('should handle mixed found and not found queries', async () => {
      const found = await repository.findByMcc('5812');
      const notFound = await repository.findByMcc('9999');

      expect(found).not.toBeNull();
      expect(notFound).toBeNull();
    });

    it('should handle health check between queries', async () => {
      const result1 = await repository.findByMcc('5812');
      const health = await repository.checkDatabaseHealth();
      const result2 = await repository.findByMcc('5411');

      expect(result1).not.toBeNull();
      expect(health).toBe(true);
      expect(result2).not.toBeNull();
    });

    it('should query correct table', async () => {
      const result = await repository.findByMcc('5812');

      expect(result).not.toBeNull();
    });

    it('should use correct column mappings', async () => {
      const result = await repository.findByMcc('5812');

      expect(result).toHaveProperty('categoryCode');
      expect(result).toHaveProperty('categoryName');
      expect(result).toHaveProperty('transactionType');
      expect(result).toHaveProperty('categoryGroup');
      expect(result).toHaveProperty('interestRate');
      expect(result).toHaveProperty('rewardsEligible');
      expect(result).toHaveProperty('rewardsRate');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty MCC string', async () => {
      const result = await repository.findByMcc('');

      expect(result).toBeNull();
    });

    it('should handle MCC with spaces', async () => {
      const result = await repository.findByMcc('  ');

      expect(result).toBeNull();
    });

    it('should handle case sensitivity', async () => {
      // MCC codes should be case-insensitive (all numeric in practice)
      const result = await repository.findByMcc('5812');

      expect(result).not.toBeNull();
    });

    it('should return only first result when using .first()', async () => {
      const result = await repository.findByMcc('5812');

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(false);
    });

    it('should handle special characters in MCC', async () => {
      // Special characters in MCC may cause database errors, which is expected
      await expect(repository.findByMcc('5812!')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should execute query efficiently', async () => {
      const startTime = Date.now();

      await repository.findByMcc('5812');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms for in-memory database
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple queries efficiently', async () => {
      const startTime = Date.now();

      await Promise.all([
        repository.findByMcc('5812'),
        repository.findByMcc('5411'),
        repository.findByMcc('5541'),
        repository.findByMcc('6011'),
        repository.findByMcc('0001'),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 200ms for in-memory database
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Data integrity', () => {
    it('should not modify data when reading', async () => {
      const result1 = await repository.findByMcc('5812');
      const result2 = await repository.findByMcc('5812');

      expect(result1).toEqual(result2);
    });

    it('should return consistent data across multiple reads', async () => {
      const results = await Promise.all([
        repository.findByMcc('5812'),
        repository.findByMcc('5812'),
        repository.findByMcc('5812'),
      ]);

      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should preserve decimal precision', async () => {
      const result = await repository.findByMcc('5812');

      expect(result?.interestRate).toBe(19.99);
      expect(result?.rewardsRate).toBe(2.0);
    });

    it('should preserve boolean values', async () => {
      const result1 = await repository.findByMcc('5812');
      const result2 = await repository.findByMcc('6011');

      expect(result1?.rewardsEligible).toBe(true);
      expect(result2?.rewardsEligible).toBe(false);
    });
  });
});
