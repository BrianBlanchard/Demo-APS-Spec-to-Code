describe('Database', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockConfig: Record<string, unknown>;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    mockConfig = {};

    jest.mock('../../src/config/config', () => ({
      config: {
        db: {
          host: 'test-host',
          port: 5432,
          name: 'test-db',
          user: 'test-user',
          password: 'test-password',
          poolMin: 2,
          poolMax: 10,
        },
      },
    }));

    jest.mock('knex', () => {
      return (config: Record<string, unknown>) => {
        mockConfig = config;
        return {
          destroy: jest.fn().mockResolvedValue(undefined),
        };
      };
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('createDatabaseConnection', () => {
    it('should create knex instance with pg client', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      expect(mockConfig.client).toBe('pg');
    });

    it('should use config host', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const connection = mockConfig.connection as Record<string, unknown>;
      expect(connection.host).toBe('test-host');
    });

    it('should use config port', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const connection = mockConfig.connection as Record<string, unknown>;
      expect(connection.port).toBe(5432);
    });

    it('should use config database name', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const connection = mockConfig.connection as Record<string, unknown>;
      expect(connection.database).toBe('test-db');
    });

    it('should use config user', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const connection = mockConfig.connection as Record<string, unknown>;
      expect(connection.user).toBe('test-user');
    });

    it('should use config password', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const connection = mockConfig.connection as Record<string, unknown>;
      expect(connection.password).toBe('test-password');
    });

    it('should configure pool with min connections', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const pool = mockConfig.pool as Record<string, unknown>;
      expect(pool.min).toBe(2);
    });

    it('should configure pool with max connections', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      const pool = mockConfig.pool as Record<string, unknown>;
      expect(pool.max).toBe(10);
    });

    it('should set acquire connection timeout to 10000ms', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      createDatabaseConnection();

      expect(mockConfig.acquireConnectionTimeout).toBe(10000);
    });

    it('should return knex instance', () => {
      const { createDatabaseConnection } = require('../../src/config/database');
      const db = createDatabaseConnection();

      expect(db).toBeDefined();
      expect(typeof db).toBe('object');
    });
  });

  describe('getDatabase', () => {
    it('should create database connection on first call', () => {
      const { getDatabase } = require('../../src/config/database');
      const db = getDatabase();

      expect(db).toBeDefined();
    });

    it('should return same instance on subsequent calls', () => {
      const { getDatabase } = require('../../src/config/database');
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);
    });

    it('should only create connection once', () => {
      jest.resetModules();
      const createSpy = jest.fn();

      jest.mock('knex', () => {
        return (_config: Record<string, unknown>) => {
          createSpy();
          return {
            destroy: jest.fn().mockResolvedValue(undefined),
          };
        };
      });

      const { getDatabase } = require('../../src/config/database');
      getDatabase();
      getDatabase();
      getDatabase();

      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeDatabaseConnection', () => {
    it('should call destroy on database instance', async () => {
      const destroySpy = jest.fn().mockResolvedValue(undefined);

      jest.resetModules();
      jest.mock('knex', () => {
        return () => ({
          destroy: destroySpy,
        });
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      getDatabase();
      await closeDatabaseConnection();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should set instance to null after closing', async () => {
      const destroySpy = jest.fn().mockResolvedValue(undefined);

      jest.resetModules();
      jest.mock('knex', () => {
        return () => ({
          destroy: destroySpy,
        });
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      getDatabase();
      await closeDatabaseConnection();

      const db = getDatabase();
      expect(db).toBeDefined();
    });

    it('should create new instance after closing', async () => {
      const destroySpy = jest.fn().mockResolvedValue(undefined);
      const createSpy = jest.fn();

      jest.resetModules();
      jest.mock('knex', () => {
        return () => {
          createSpy();
          return {
            destroy: destroySpy,
          };
        };
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      getDatabase();
      await closeDatabaseConnection();
      getDatabase();

      expect(createSpy).toHaveBeenCalledTimes(2);
    });

    it('should not fail if called when no connection exists', async () => {
      const { closeDatabaseConnection } = require('../../src/config/database');

      await expect(closeDatabaseConnection()).resolves.toBeUndefined();
    });

    it('should not fail if called multiple times', async () => {
      const destroySpy = jest.fn().mockResolvedValue(undefined);

      jest.resetModules();
      jest.mock('knex', () => {
        return () => ({
          destroy: destroySpy,
        });
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      getDatabase();
      await closeDatabaseConnection();
      await closeDatabaseConnection();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should be async', async () => {
      const { closeDatabaseConnection } = require('../../src/config/database');
      const result = closeDatabaseConnection();

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('should handle destroy errors gracefully', async () => {
      const destroySpy = jest.fn().mockRejectedValue(new Error('Destroy failed'));

      jest.resetModules();
      jest.mock('knex', () => {
        return () => ({
          destroy: destroySpy,
        });
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      getDatabase();

      await expect(closeDatabaseConnection()).rejects.toThrow('Destroy failed');
    });
  });

  describe('singleton pattern', () => {
    it('should maintain singleton across requires', () => {
      const module1 = require('../../src/config/database');
      const module2 = require('../../src/config/database');

      const db1 = module1.getDatabase();
      const db2 = module2.getDatabase();

      expect(db1).toBe(db2);
    });

    it('should reset singleton after close', async () => {
      const destroySpy = jest.fn().mockResolvedValue(undefined);

      jest.resetModules();
      jest.mock('knex', () => {
        return () => ({
          destroy: destroySpy,
        });
      });

      const { getDatabase, closeDatabaseConnection } = require('../../src/config/database');
      const db1 = getDatabase();
      await closeDatabaseConnection();
      const db2 = getDatabase();

      expect(db1).not.toBe(db2);
    });
  });
});
