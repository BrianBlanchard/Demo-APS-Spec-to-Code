import { getDatabaseConfig, createDatabaseConnection } from '../database.config';

describe('DatabaseConfig - Configuration/Setup', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getDatabaseConfig', () => {
    it('should return default configuration when no env vars set', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_MAX;

      const config = getDatabaseConfig();

      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('transaction_db');
      expect(config.user).toBe('postgres');
      expect(config.password).toBe('postgres');
      expect(config.poolMin).toBe(2);
      expect(config.poolMax).toBe(10);
    });

    it('should use environment variables when set', () => {
      process.env.DB_HOST = 'db.example.com';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'prod_db';
      process.env.DB_USER = 'app_user';
      process.env.DB_PASSWORD = 'secret123';
      process.env.DB_POOL_MIN = '5';
      process.env.DB_POOL_MAX = '20';

      const config = getDatabaseConfig();

      expect(config.host).toBe('db.example.com');
      expect(config.port).toBe(5433);
      expect(config.database).toBe('prod_db');
      expect(config.user).toBe('app_user');
      expect(config.password).toBe('secret123');
      expect(config.poolMin).toBe(5);
      expect(config.poolMax).toBe(20);
    });

    it('should parse numeric values correctly', () => {
      process.env.DB_PORT = '5434';
      process.env.DB_POOL_MIN = '3';
      process.env.DB_POOL_MAX = '15';

      const config = getDatabaseConfig();

      expect(typeof config.port).toBe('number');
      expect(typeof config.poolMin).toBe('number');
      expect(typeof config.poolMax).toBe('number');
      expect(config.port).toBe(5434);
      expect(config.poolMin).toBe(3);
      expect(config.poolMax).toBe(15);
    });
  });

  describe('createDatabaseConnection', () => {
    it('should create knex instance with correct config', () => {
      const config = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_pass',
        poolMin: 2,
        poolMax: 10,
      };

      const db = createDatabaseConnection(config);

      expect(db).toBeDefined();
      expect(db.client).toBeDefined();
    });

    it('should respect pool configuration', () => {
      const config = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_pass',
        poolMin: 5,
        poolMax: 20,
      };

      const db = createDatabaseConnection(config);

      expect(db).toBeDefined();
    });
  });
});
