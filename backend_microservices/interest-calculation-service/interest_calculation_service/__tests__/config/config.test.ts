describe('Config', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('default configuration', () => {
    it('should use development as default environment', () => {
      delete process.env.NODE_ENV;
      const { config } = require('../../src/config/config');
      expect(config.env).toBe('development');
    });

    it('should use 3000 as default port', () => {
      delete process.env.PORT;
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(3000);
    });

    it('should use localhost as default database host', () => {
      delete process.env.DB_HOST;
      const { config } = require('../../src/config/config');
      expect(config.db.host).toBe('localhost');
    });

    it('should use 5432 as default database port', () => {
      delete process.env.DB_PORT;
      const { config } = require('../../src/config/config');
      expect(config.db.port).toBe(5432);
    });

    it('should use interest_calculation as default database name', () => {
      delete process.env.DB_NAME;
      const { config } = require('../../src/config/config');
      expect(config.db.name).toBe('interest_calculation');
    });

    it('should use postgres as default database user', () => {
      delete process.env.DB_USER;
      const { config } = require('../../src/config/config');
      expect(config.db.user).toBe('postgres');
    });

    it('should use postgres as default database password', () => {
      delete process.env.DB_PASSWORD;
      const { config } = require('../../src/config/config');
      expect(config.db.password).toBe('postgres');
    });

    it('should use 2 as default pool min', () => {
      delete process.env.DB_POOL_MIN;
      const { config } = require('../../src/config/config');
      expect(config.db.poolMin).toBe(2);
    });

    it('should use 10 as default pool max', () => {
      delete process.env.DB_POOL_MAX;
      const { config } = require('../../src/config/config');
      expect(config.db.poolMax).toBe(10);
    });

    it('should use http://localhost:3001 as default interest rate service URL', () => {
      delete process.env.INTEREST_RATE_SERVICE_URL;
      const { config } = require('../../src/config/config');
      expect(config.services.interestRateServiceUrl).toBe('http://localhost:3001');
    });

    it('should use info as default log level', () => {
      delete process.env.LOG_LEVEL;
      const { config } = require('../../src/config/config');
      expect(config.logging.level).toBe('info');
    });

    it('should use * as default CORS allow origin', () => {
      delete process.env.CORS_ALLOW_ORIGIN;
      const { config } = require('../../src/config/config');
      expect(config.cors.allowOrigin).toBe('*');
    });

    it('should use 60000 as default rate limit window', () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;
      const { config } = require('../../src/config/config');
      expect(config.rateLimit.windowMs).toBe(60000);
    });

    it('should use 100 as default rate limit max requests', () => {
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
      const { config } = require('../../src/config/config');
      expect(config.rateLimit.maxRequests).toBe(100);
    });
  });

  describe('environment variable overrides', () => {
    it('should use NODE_ENV when set', () => {
      process.env.NODE_ENV = 'production';
      const { config } = require('../../src/config/config');
      expect(config.env).toBe('production');
    });

    it('should use PORT when set', () => {
      process.env.PORT = '8080';
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(8080);
    });

    it('should use DB_HOST when set', () => {
      process.env.DB_HOST = 'db.example.com';
      const { config } = require('../../src/config/config');
      expect(config.db.host).toBe('db.example.com');
    });

    it('should use DB_PORT when set', () => {
      process.env.DB_PORT = '5433';
      const { config } = require('../../src/config/config');
      expect(config.db.port).toBe(5433);
    });

    it('should use DB_NAME when set', () => {
      process.env.DB_NAME = 'production_db';
      const { config } = require('../../src/config/config');
      expect(config.db.name).toBe('production_db');
    });

    it('should use DB_USER when set', () => {
      process.env.DB_USER = 'admin';
      const { config } = require('../../src/config/config');
      expect(config.db.user).toBe('admin');
    });

    it('should use DB_PASSWORD when set', () => {
      process.env.DB_PASSWORD = 'secret123';
      const { config } = require('../../src/config/config');
      expect(config.db.password).toBe('secret123');
    });

    it('should use DB_POOL_MIN when set', () => {
      process.env.DB_POOL_MIN = '5';
      const { config } = require('../../src/config/config');
      expect(config.db.poolMin).toBe(5);
    });

    it('should use DB_POOL_MAX when set', () => {
      process.env.DB_POOL_MAX = '20';
      const { config } = require('../../src/config/config');
      expect(config.db.poolMax).toBe(20);
    });

    it('should use INTEREST_RATE_SERVICE_URL when set', () => {
      process.env.INTEREST_RATE_SERVICE_URL = 'https://rates.example.com';
      const { config } = require('../../src/config/config');
      expect(config.services.interestRateServiceUrl).toBe('https://rates.example.com');
    });

    it('should use LOG_LEVEL when set', () => {
      process.env.LOG_LEVEL = 'debug';
      const { config } = require('../../src/config/config');
      expect(config.logging.level).toBe('debug');
    });

    it('should use CORS_ALLOW_ORIGIN when set', () => {
      process.env.CORS_ALLOW_ORIGIN = 'https://example.com';
      const { config } = require('../../src/config/config');
      expect(config.cors.allowOrigin).toBe('https://example.com');
    });

    it('should use RATE_LIMIT_WINDOW_MS when set', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '120000';
      const { config } = require('../../src/config/config');
      expect(config.rateLimit.windowMs).toBe(120000);
    });

    it('should use RATE_LIMIT_MAX_REQUESTS when set', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '200';
      const { config } = require('../../src/config/config');
      expect(config.rateLimit.maxRequests).toBe(200);
    });
  });

  describe('type parsing', () => {
    it('should parse PORT as integer', () => {
      process.env.PORT = '9000';
      const { config } = require('../../src/config/config');
      expect(typeof config.port).toBe('number');
      expect(config.port).toBe(9000);
    });

    it('should parse DB_PORT as integer', () => {
      process.env.DB_PORT = '5434';
      const { config } = require('../../src/config/config');
      expect(typeof config.db.port).toBe('number');
      expect(config.db.port).toBe(5434);
    });

    it('should parse DB_POOL_MIN as integer', () => {
      process.env.DB_POOL_MIN = '3';
      const { config } = require('../../src/config/config');
      expect(typeof config.db.poolMin).toBe('number');
      expect(config.db.poolMin).toBe(3);
    });

    it('should parse DB_POOL_MAX as integer', () => {
      process.env.DB_POOL_MAX = '15';
      const { config } = require('../../src/config/config');
      expect(typeof config.db.poolMax).toBe('number');
      expect(config.db.poolMax).toBe(15);
    });

    it('should parse RATE_LIMIT_WINDOW_MS as integer', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '90000';
      const { config } = require('../../src/config/config');
      expect(typeof config.rateLimit.windowMs).toBe('number');
      expect(config.rateLimit.windowMs).toBe(90000);
    });

    it('should parse RATE_LIMIT_MAX_REQUESTS as integer', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '150';
      const { config } = require('../../src/config/config');
      expect(typeof config.rateLimit.maxRequests).toBe('number');
      expect(config.rateLimit.maxRequests).toBe(150);
    });

    it('should handle PORT with leading zeros', () => {
      process.env.PORT = '08080';
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(8080);
    });

    it('should use base 10 for parsing integers', () => {
      process.env.DB_PORT = '010';
      const { config } = require('../../src/config/config');
      expect(config.db.port).toBe(10);
    });
  });

  describe('configuration structure', () => {
    it('should have env property', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('env');
    });

    it('should have port property', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('port');
    });

    it('should have db object', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('db');
      expect(typeof config.db).toBe('object');
    });

    it('should have services object', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('services');
      expect(typeof config.services).toBe('object');
    });

    it('should have logging object', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('logging');
      expect(typeof config.logging).toBe('object');
    });

    it('should have cors object', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('cors');
      expect(typeof config.cors).toBe('object');
    });

    it('should have rateLimit object', () => {
      const { config } = require('../../src/config/config');
      expect(config).toHaveProperty('rateLimit');
      expect(typeof config.rateLimit).toBe('object');
    });

    it('should have all db properties', () => {
      const { config } = require('../../src/config/config');
      expect(config.db).toHaveProperty('host');
      expect(config.db).toHaveProperty('port');
      expect(config.db).toHaveProperty('name');
      expect(config.db).toHaveProperty('user');
      expect(config.db).toHaveProperty('password');
      expect(config.db).toHaveProperty('poolMin');
      expect(config.db).toHaveProperty('poolMax');
    });

    it('should have interestRateServiceUrl in services', () => {
      const { config } = require('../../src/config/config');
      expect(config.services).toHaveProperty('interestRateServiceUrl');
    });

    it('should have level in logging', () => {
      const { config } = require('../../src/config/config');
      expect(config.logging).toHaveProperty('level');
    });

    it('should have allowOrigin in cors', () => {
      const { config } = require('../../src/config/config');
      expect(config.cors).toHaveProperty('allowOrigin');
    });

    it('should have windowMs and maxRequests in rateLimit', () => {
      const { config } = require('../../src/config/config');
      expect(config.rateLimit).toHaveProperty('windowMs');
      expect(config.rateLimit).toHaveProperty('maxRequests');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string environment variables', () => {
      process.env.PORT = '';
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(3000);
    });

    it('should handle whitespace in environment variables', () => {
      process.env.DB_HOST = '  localhost  ';
      const { config } = require('../../src/config/config');
      expect(config.db.host).toBe('  localhost  ');
    });

    it('should handle non-numeric PORT gracefully', () => {
      process.env.PORT = 'invalid';
      const { config } = require('../../src/config/config');
      expect(isNaN(config.port)).toBe(true);
    });

    it('should handle zero as PORT', () => {
      process.env.PORT = '0';
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(0);
    });

    it('should handle large port numbers', () => {
      process.env.PORT = '65535';
      const { config } = require('../../src/config/config');
      expect(config.port).toBe(65535);
    });

    it('should handle negative pool sizes', () => {
      process.env.DB_POOL_MIN = '-1';
      const { config } = require('../../src/config/config');
      expect(config.db.poolMin).toBe(-1);
    });
  });
});
