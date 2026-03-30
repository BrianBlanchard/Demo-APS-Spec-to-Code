import { Pool } from 'pg';
import { Database } from '../database';
import { logger } from '../../utils/logger';

jest.mock('pg');
jest.mock('../../utils/logger');
jest.mock('../../config', () => ({
  config: {
    db: {
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      pool: {
        min: 2,
        max: 10,
      },
    },
  },
}));

describe('Database', () => {
  let database: Database;
  let mockPool: any;
  let mockPoolOn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPoolOn = jest.fn();
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      on: mockPoolOn,
    } as any;

    (Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => mockPool);

    database = new Database();
  });

  describe('constructor', () => {
    it('should create a pool with correct configuration', () => {
      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
        min: 2,
        max: 10,
      });
    });

    it('should register error event handler', () => {
      expect(mockPoolOn).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should log unexpected pool errors', () => {
      const errorHandler = mockPoolOn.mock.calls[0][1];
      const testError = new Error('Connection lost');

      errorHandler(testError);

      expect(logger.error).toHaveBeenCalledWith(
        { error: 'Connection lost' },
        'Unexpected database pool error'
      );
    });
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
        rowCount: 2,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query<{ id: number; name: string }>(
        'SELECT * FROM users',
        []
      );

      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', []);
      expect(logger.debug).toHaveBeenCalledWith(
        {
          query: 'SELECT * FROM users',
          duration: expect.any(Number),
          rows: 2,
        },
        'Database query executed'
      );
    });

    it('should execute query with parameters', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'John' }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query<{ id: number; name: string }>(
        'SELECT * FROM users WHERE id = $1',
        [1]
      );

      expect(result).toEqual([{ id: 1, name: 'John' }]);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should execute query without parameters', async () => {
      const mockResult = {
        rows: [{ count: 5 }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query<{ count: number }>('SELECT COUNT(*) FROM users');

      expect(result).toEqual([{ count: 5 }]);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT COUNT(*) FROM users', undefined);
    });

    it('should return empty array when no rows found', async () => {
      const mockResult = {
        rows: [],
        rowCount: 0,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query<{ id: number }>('SELECT * FROM users WHERE id = $1', [999]);

      expect(result).toEqual([]);
      expect(logger.debug).toHaveBeenCalledWith(
        expect.objectContaining({ rows: 0 }),
        'Database query executed'
      );
    });

    it('should log error and rethrow on query failure', async () => {
      const testError = new Error('Connection timeout');
      mockPool.query.mockRejectedValue(testError);

      await expect(
        database.query('SELECT * FROM users')
      ).rejects.toThrow('Connection timeout');

      expect(logger.error).toHaveBeenCalledWith(
        { error: testError, query: 'SELECT * FROM users' },
        'Database query failed'
      );
    });

    it('should measure query duration', async () => {
      const mockResult = {
        rows: [{ id: 1 }],
        rowCount: 1,
      };

      mockPool.query.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockResult), 10);
        });
      });

      await database.query('SELECT * FROM users');

      const logCall = (logger.debug as jest.Mock).mock.calls[0][0];
      expect(logCall.duration).toBeGreaterThanOrEqual(10);
    });

    it('should handle complex query with multiple parameters', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'John', age: 30 }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      await database.query(
        'SELECT * FROM users WHERE name = $1 AND age > $2',
        ['John', 25]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE name = $1 AND age > $2',
        ['John', 25]
      );
    });
  });

  describe('getClient', () => {
    it('should return a pool client', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      } as any;

      mockPool.connect.mockResolvedValue(mockClient);

      const client = await database.getClient();

      expect(client).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalled();
    });

    it('should throw error when connection fails', async () => {
      const testError = new Error('Pool exhausted');
      mockPool.connect.mockRejectedValue(testError);

      await expect(database.getClient()).rejects.toThrow('Pool exhausted');
    });
  });

  describe('close', () => {
    it('should close the pool', async () => {
      mockPool.end.mockResolvedValue(undefined);

      await database.close();

      expect(mockPool.end).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Database pool closed');
    });

    it('should handle close errors', async () => {
      const testError = new Error('Close failed');
      mockPool.end.mockRejectedValue(testError);

      await expect(database.close()).rejects.toThrow('Close failed');
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      const mockResult = {
        rows: [{ '?column?': 1 }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const isHealthy = await database.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1', undefined);
    });

    it('should return false when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection refused'));

      const isHealthy = await database.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should not throw error on health check failure', async () => {
      mockPool.query.mockRejectedValue(new Error('Timeout'));

      await expect(database.healthCheck()).resolves.toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple concurrent queries', async () => {
      const mockResult = {
        rows: [{ id: 1 }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const queries = [
        database.query('SELECT * FROM users WHERE id = $1', [1]),
        database.query('SELECT * FROM users WHERE id = $1', [2]),
        database.query('SELECT * FROM users WHERE id = $1', [3]),
      ];

      const results = await Promise.all(queries);

      expect(results).toHaveLength(3);
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('should handle transaction-like pattern with getClient', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
      } as any;

      mockPool.connect.mockResolvedValue(mockClient);

      const client = await database.getClient();
      await client.query('BEGIN');
      await client.query('INSERT INTO users (name) VALUES ($1)', ['John']);
      await client.query('COMMIT');
      client.release();

      expect(mockClient.query).toHaveBeenCalledTimes(3);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle errors during transaction', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
          .mockRejectedValueOnce(new Error('Insert failed')) // INSERT
          .mockResolvedValueOnce({ rows: [], rowCount: 0 }), // ROLLBACK
        release: jest.fn(),
      } as any;

      mockPool.connect.mockResolvedValue(mockClient);

      const client = await database.getClient();
      await client.query('BEGIN');

      await expect(
        client.query('INSERT INTO users (name) VALUES ($1)', ['John'])
      ).rejects.toThrow('Insert failed');

      await client.query('ROLLBACK');
      client.release();

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle query with null result', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ result: null }],
        rowCount: 1,
      } as any);

      const result = await database.query<{ result: null }>('SELECT NULL as result');

      expect(result).toEqual([{ result: null }]);
    });

    it('should handle query with large result set', async () => {
      const largeResult = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
      mockPool.query.mockResolvedValue({
        rows: largeResult,
        rowCount: 10000,
      } as any);

      const result = await database.query<{ id: number }>('SELECT * FROM large_table');

      expect(result).toHaveLength(10000);
    });

    it('should handle multiple error event listeners', () => {
      const errorHandler1 = mockPoolOn.mock.calls[0][1];
      const testError = new Error('Error 1');

      errorHandler1(testError);
      errorHandler1(new Error('Error 2'));

      expect(logger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('type safety', () => {
    it('should return typed results', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockResult = {
        rows: [{ id: 1, name: 'John', email: 'john@example.com' }],
        rowCount: 1,
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await database.query<User>('SELECT * FROM users');

      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('John');
      expect(result[0].email).toBe('john@example.com');
    });
  });
});
