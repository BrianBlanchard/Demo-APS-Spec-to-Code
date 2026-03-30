import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  server: {
    port: number;
    env: string;
    logLevel: string;
    apiBasePath: string;
    apiVersion: string;
    capabilityName: string;
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
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  externalServices: {
    customerKycServiceUrl: string;
  };
  account: {
    defaultTermMonths: number;
    reissuanceWindowDays: number;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    apiBasePath: process.env.API_BASE_PATH || '/api',
    apiVersion: process.env.API_VERSION || 'v1',
    capabilityName: process.env.CAPABILITY_NAME || 'accounts',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'account_service',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50', 10),
  },
  externalServices: {
    customerKycServiceUrl:
      process.env.CUSTOMER_KYC_SERVICE_URL || 'http://localhost:3001/api/v1/kyc',
  },
  account: {
    defaultTermMonths: parseInt(process.env.DEFAULT_ACCOUNT_TERM_MONTHS || '36', 10),
    reissuanceWindowDays: parseInt(process.env.REISSUANCE_WINDOW_DAYS || '60', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

export default config;
