import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    port: number;
    host: string;
    env: string;
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
  encryption: {
    key: string;
    algorithm: string;
  };
  jwt: {
    secret: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
    prettyPrint: boolean;
  };
  cors: {
    origin: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'card_issuance_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.LOG_PRETTY_PRINT === 'true',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
