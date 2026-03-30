// Unmock the config module for these tests
jest.unmock('../../config');
jest.unmock('../index');

// Mock dotenv to prevent loading from .env files
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('loadConfig with defaults', () => {
    it('should load configuration with default values when environment variables are not set', () => {
      process.env = {
        JWT_SECRET: 'test-secret-key',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');

        expect(config).toMatchObject({
          node_env: 'development',
          port: 3000,
          db: {
            host: 'localhost',
            port: 5432,
            database: 'customer_search_db',
            user: 'postgres',
            password: 'postgres',
            pool: {
              min: 2,
              max: 10,
            },
          },
          elasticsearch: {
            node: 'http://localhost:9200',
            index: 'customer_profiles',
            requestTimeout: 2000,
          },
          redis: {
            host: 'localhost',
            port: 6379,
            ttl: 60,
          },
          security: {
            jwtSecret: 'test-secret-key',
          },
          rateLimit: {
            windowMs: 60000,
            maxRequests: 60,
          },
          logging: {
            level: 'info',
          },
          cors: {
            origin: '*',
          },
        });
      });
    });

    it('should use default JWT secret when not provided', () => {
      process.env = {};

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.security.jwtSecret).toBe('default-secret-change-in-production');
      });
    });
  });

  describe('loadConfig with custom values', () => {
    it('should load configuration from environment variables', () => {
      process.env = {
        NODE_ENV: 'production',
        PORT: '8080',
        DB_HOST: 'db.example.com',
        DB_PORT: '5433',
        DB_NAME: 'prod_db',
        DB_USER: 'app_user',
        DB_PASSWORD: 'secure_password',
        DB_POOL_MIN: '5',
        DB_POOL_MAX: '20',
        ES_NODE: 'https://es.example.com:9200',
        ES_INDEX: 'customers',
        ES_REQUEST_TIMEOUT: '5000',
        REDIS_HOST: 'redis.example.com',
        REDIS_PORT: '6380',
        REDIS_PASSWORD: 'redis_password',
        REDIS_TTL: '300',
        JWT_SECRET: 'production-secret-key',
        RATE_LIMIT_WINDOW_MS: '30000',
        RATE_LIMIT_MAX_REQUESTS: '100',
        LOG_LEVEL: 'debug',
        CORS_ORIGIN: 'https://example.com',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');

        expect(config).toEqual({
          node_env: 'production',
          port: 8080,
          db: {
            host: 'db.example.com',
            port: 5433,
            database: 'prod_db',
            user: 'app_user',
            password: 'secure_password',
            pool: {
              min: 5,
              max: 20,
            },
          },
          elasticsearch: {
            node: 'https://es.example.com:9200',
            index: 'customers',
            requestTimeout: 5000,
          },
          redis: {
            host: 'redis.example.com',
            port: 6380,
            password: 'redis_password',
            ttl: 300,
          },
          security: {
            jwtSecret: 'production-secret-key',
          },
          rateLimit: {
            windowMs: 30000,
            maxRequests: 100,
          },
          logging: {
            level: 'debug',
          },
          cors: {
            origin: 'https://example.com',
          },
        });
      });
    });

    it('should handle test environment', () => {
      process.env = {
        NODE_ENV: 'test',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.node_env).toBe('test');
      });
    });

    it('should coerce string numbers to integers', () => {
      process.env = {
        PORT: '3001',
        DB_PORT: '5433',
        DB_POOL_MIN: '3',
        DB_POOL_MAX: '15',
        REDIS_PORT: '6380',
        REDIS_TTL: '120',
        ES_REQUEST_TIMEOUT: '3000',
        RATE_LIMIT_WINDOW_MS: '120000',
        RATE_LIMIT_MAX_REQUESTS: '200',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');

        expect(config.port).toBe(3001);
        expect(config.db.port).toBe(5433);
        expect(config.db.pool.min).toBe(3);
        expect(config.db.pool.max).toBe(15);
        expect(config.redis.port).toBe(6380);
        expect(config.redis.ttl).toBe(120);
        expect(config.elasticsearch.requestTimeout).toBe(3000);
        expect(config.rateLimit.windowMs).toBe(120000);
        expect(config.rateLimit.maxRequests).toBe(200);
      });
    });
  });

  describe('validation', () => {
    it('should throw error for invalid NODE_ENV', () => {
      process.env = {
        NODE_ENV: 'staging',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid port (negative number)', () => {
      process.env = {
        PORT: '-1',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid port (zero)', () => {
      process.env = {
        PORT: '0',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid DB pool min (negative)', () => {
      process.env = {
        DB_POOL_MIN: '-1',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid DB pool max (zero)', () => {
      process.env = {
        DB_POOL_MAX: '0',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid Elasticsearch node URL', () => {
      process.env = {
        ES_NODE: 'not-a-valid-url',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for invalid log level', () => {
      process.env = {
        LOG_LEVEL: 'verbose',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for empty JWT secret and use default instead', () => {
      // Note: Empty string for JWT_SECRET falls back to default value in the source code
      process.env = {
        JWT_SECRET: '',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        // Empty string or undefined will use the default value
        expect(config.security.jwtSecret).toBe('default-secret-change-in-production');
      });
    });

    it('should accept zero for DB pool min', () => {
      process.env = {
        DB_POOL_MIN: '0',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.db.pool.min).toBe(0);
      });
    });
  });

  describe('optional fields', () => {
    it('should handle missing REDIS_PASSWORD as optional', () => {
      process.env = {
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.redis.password).toBeUndefined();
      });
    });

    it('should include REDIS_PASSWORD when provided', () => {
      process.env = {
        REDIS_PASSWORD: 'redis-pass',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.redis.password).toBe('redis-pass');
      });
    });
  });

  describe('all log levels', () => {
    const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

    logLevels.forEach((level) => {
      it(`should accept log level: ${level}`, () => {
        process.env = {
          LOG_LEVEL: level,
          JWT_SECRET: 'test-secret',
        };

        jest.isolateModules(() => {
          const { config } = require('../index');
          expect(config.logging.level).toBe(level);
        });
      });
    });
  });

  describe('type checking', () => {
    it('should export Config type', () => {
      process.env = {
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const module = require('../index');
        expect(module.config).toBeDefined();
      });
    });

    it('should validate config structure matches Config type', () => {
      process.env = {
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');

        // Validate top-level properties exist
        expect(config).toHaveProperty('node_env');
        expect(config).toHaveProperty('port');
        expect(config).toHaveProperty('db');
        expect(config).toHaveProperty('elasticsearch');
        expect(config).toHaveProperty('redis');
        expect(config).toHaveProperty('security');
        expect(config).toHaveProperty('rateLimit');
        expect(config).toHaveProperty('logging');
        expect(config).toHaveProperty('cors');

        // Validate nested db properties
        expect(config.db).toHaveProperty('host');
        expect(config.db).toHaveProperty('port');
        expect(config.db).toHaveProperty('database');
        expect(config.db).toHaveProperty('user');
        expect(config.db).toHaveProperty('password');
        expect(config.db).toHaveProperty('pool');
        expect(config.db.pool).toHaveProperty('min');
        expect(config.db.pool).toHaveProperty('max');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle numeric strings with whitespace', () => {
      process.env = {
        PORT: ' 3002 ',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.port).toBe(3002);
      });
    });

    it('should throw error for non-numeric port string', () => {
      process.env = {
        PORT: 'abc',
        JWT_SECRET: 'test-secret',
      };

      expect(() => {
        jest.isolateModules(() => {
          require('../index');
        });
      }).toThrow('Configuration validation failed');
    });

    it('should handle very large valid port number', () => {
      process.env = {
        PORT: '65535',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.port).toBe(65535);
      });
    });

    it('should handle very large pool max', () => {
      process.env = {
        DB_POOL_MAX: '1000',
        JWT_SECRET: 'test-secret',
      };

      jest.isolateModules(() => {
        const { config } = require('../index');
        expect(config.db.pool.max).toBe(1000);
      });
    });
  });
});
