import { getDatabaseConfig, getKnexConfig } from '../database.config';

describe('Database Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getDatabaseConfig', () => {
    it('should return default configuration when env vars not set', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_MAX;

      const config = getDatabaseConfig();

      expect(config).toEqual({
        host: 'localhost',
        port: 5432,
        database: 'payment_confirmation_db',
        user: 'postgres',
        password: 'postgres',
        min: 2,
        max: 10,
      });
    });

    it('should use environment variables when provided', () => {
      process.env.DB_HOST = 'db.example.com';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'custom_db';
      process.env.DB_USER = 'admin';
      process.env.DB_PASSWORD = 'secret';
      process.env.DB_POOL_MIN = '5';
      process.env.DB_POOL_MAX = '20';

      const config = getDatabaseConfig();

      expect(config).toEqual({
        host: 'db.example.com',
        port: 5433,
        database: 'custom_db',
        user: 'admin',
        password: 'secret',
        min: 5,
        max: 20,
      });
    });

    it('should parse port as integer', () => {
      process.env.DB_PORT = '3306';

      const config = getDatabaseConfig();

      expect(typeof config.port).toBe('number');
      expect(config.port).toBe(3306);
    });

    it('should parse pool min as integer', () => {
      process.env.DB_POOL_MIN = '3';

      const config = getDatabaseConfig();

      expect(typeof config.min).toBe('number');
      expect(config.min).toBe(3);
    });

    it('should parse pool max as integer', () => {
      process.env.DB_POOL_MAX = '15';

      const config = getDatabaseConfig();

      expect(typeof config.max).toBe('number');
      expect(config.max).toBe(15);
    });

    it('should handle partial environment variables', () => {
      process.env.DB_HOST = 'custom-host';
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;

      const config = getDatabaseConfig();

      expect(config.host).toBe('custom-host');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('payment_confirmation_db');
    });
  });

  describe('getKnexConfig', () => {
    it('should return Knex configuration with correct structure', () => {
      const config = getKnexConfig();

      expect(config).toHaveProperty('client');
      expect(config).toHaveProperty('connection');
      expect(config).toHaveProperty('pool');
      expect(config).toHaveProperty('migrations');
    });

    it('should use pg client', () => {
      const config = getKnexConfig();

      expect(config.client).toBe('pg');
    });

    it('should include database connection details', () => {
      process.env.DB_HOST = 'testhost';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'testdb';
      process.env.DB_USER = 'testuser';
      process.env.DB_PASSWORD = 'testpass';

      const config = getKnexConfig();

      expect(config.connection).toEqual({
        host: 'testhost',
        port: 5433,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      });
    });

    it('should include pool configuration', () => {
      process.env.DB_POOL_MIN = '3';
      process.env.DB_POOL_MAX = '15';

      const config = getKnexConfig();

      expect(config.pool).toEqual({
        min: 3,
        max: 15,
      });
    });

    it('should include migrations configuration', () => {
      const config = getKnexConfig();

      expect(config.migrations).toEqual({
        directory: './migrations',
        extension: 'ts',
      });
    });

    it('should use default values when env vars not set', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;

      const config = getKnexConfig();

      expect(config.connection).toMatchObject({
        host: 'localhost',
        port: 5432,
      });
    });

    it('should create valid Knex configuration for development', () => {
      process.env.NODE_ENV = 'development';
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';

      const config = getKnexConfig();

      expect(config.client).toBe('pg');
      expect(config.connection).toBeDefined();
      expect(config.pool).toBeDefined();
    });

    it('should create valid Knex configuration for production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DB_HOST = 'prod.example.com';
      process.env.DB_PORT = '5432';

      const config = getKnexConfig();

      expect(config.client).toBe('pg');
      expect(config.connection).toBeDefined();
    });
  });
});
