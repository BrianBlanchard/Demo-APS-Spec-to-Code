import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  env: string;
  port: number;
  logLevel: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    ttl: number;
  };
  jwt: {
    secret: string;
    issuer: string;
  };
  kafka: {
    brokers: string[];
    clientId: string;
    topicBalanceUpdated: string;
  };
  api: {
    timeoutBalanceRetrieval: number;
    timeoutBalanceUpdate: number;
    rateLimitPublic: number;
  };
  cors: {
    origin: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'account_balance',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: parseInt(process.env.REDIS_TTL || '30', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    issuer: process.env.JWT_ISSUER || 'account-balance-service',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'account-balance-service',
    topicBalanceUpdated: process.env.KAFKA_TOPIC_BALANCE_UPDATED || 'balance-updated',
  },
  api: {
    timeoutBalanceRetrieval: parseInt(process.env.API_TIMEOUT_BALANCE_RETRIEVAL || '2000', 10),
    timeoutBalanceUpdate: parseInt(process.env.API_TIMEOUT_BALANCE_UPDATE || '5000', 10),
    rateLimitPublic: parseInt(process.env.RATE_LIMIT_PUBLIC || '1000', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
