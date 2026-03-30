import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  apiBasePath: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
    connectionTimeout: number;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    ttl: number;
  };
  logging: {
    level: string;
  };
  security: {
    apiKeyHeader: string;
    internalServiceToken: string;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  validation: {
    timeoutMs: number;
    maxResponseTimeMs: number;
    duplicateTransactionWindowSeconds: number;
    cvvMaxFailures: number;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}

export const envConfig: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'transaction_validation',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '300', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  security: {
    apiKeyHeader: process.env.API_KEY_HEADER || 'X-API-Key',
    internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN || '',
  },
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000', 10),
  },
  validation: {
    timeoutMs: parseInt(process.env.VALIDATION_TIMEOUT_MS || '1000', 10),
    maxResponseTimeMs: parseInt(process.env.VALIDATION_MAX_RESPONSE_TIME_MS || '500', 10),
    duplicateTransactionWindowSeconds: parseInt(
      process.env.DUPLICATE_TRANSACTION_WINDOW_SECONDS || '120',
      10
    ),
    cvvMaxFailures: parseInt(process.env.CVV_MAX_FAILURES || '3', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};
