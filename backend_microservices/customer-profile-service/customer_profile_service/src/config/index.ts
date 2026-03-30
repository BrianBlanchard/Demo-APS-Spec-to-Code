import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    port: number;
    env: string;
    serviceName: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
  };
  rateLimit: {
    get: {
      windowMs: number;
      max: number;
    };
    put: {
      windowMs: number;
      max: number;
    };
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  logging: {
    level: string;
    prettyPrint: boolean;
  };
  jwt: {
    secret: string;
    issuer: string;
  };
  api: {
    timeoutGet: number;
    timeoutPut: number;
  };
  kafka: {
    enabled: boolean;
    brokers: string[];
    topicCustomerUpdated: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'customer-profile-service',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'customer_profile_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '300', 10),
  },
  rateLimit: {
    get: {
      windowMs: parseInt(process.env.RATE_LIMIT_GET_WINDOW_MS || '60000', 10),
      max: parseInt(process.env.RATE_LIMIT_GET_MAX || '500', 10),
    },
    put: {
      windowMs: parseInt(process.env.RATE_LIMIT_PUT_WINDOW_MS || '60000', 10),
      max: parseInt(process.env.RATE_LIMIT_PUT_MAX || '100', 10),
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.LOG_PRETTY_PRINT === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    issuer: process.env.JWT_ISSUER || 'customer-profile-service',
  },
  api: {
    timeoutGet: parseInt(process.env.API_TIMEOUT_GET || '5000', 10),
    timeoutPut: parseInt(process.env.API_TIMEOUT_PUT || '10000', 10),
  },
  kafka: {
    enabled: process.env.KAFKA_ENABLED === 'true',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topicCustomerUpdated: process.env.KAFKA_TOPIC_CUSTOMER_UPDATED || 'customer.updated',
  },
};
