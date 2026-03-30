// Mock config before any imports
jest.mock('./src/config', () => ({
  config: {
    node_env: 'test',
    port: 3000,
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
    elasticsearch: {
      node: 'http://localhost:9200',
      index: 'customer_profiles',
      requestTimeout: 2000,
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: undefined,
      ttl: 60,
    },
    security: {
      jwtSecret: 'test-secret',
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
  },
}));

// Mock logger with full pino interface
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn(function() { return this; }),
  level: 'info',
  levels: {
    values: {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    },
    labels: {
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal',
    },
  },
};

jest.mock('./src/utils/logger', () => ({
  logger: mockLogger,
}));

// Mock context middleware
jest.mock('./src/middleware/context.middleware', () => ({
  asyncLocalStorage: {
    run: jest.fn((context, callback) => callback()),
    getStore: jest.fn(() => ({
      traceId: 'test-trace-id',
      userId: 'test-user-id',
      timestamp: new Date(),
    })),
  },
  getContext: jest.fn(() => ({
    traceId: 'test-trace-id',
    userId: 'test-user-id',
    timestamp: new Date(),
  })),
  contextMiddleware: jest.fn((req, res, next) => {
    res.setHeader('x-trace-id', 'test-trace-id');
    next();
  }),
}));
