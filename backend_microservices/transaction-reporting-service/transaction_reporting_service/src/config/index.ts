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
  report: {
    expiryDays: number;
    downloadBaseUrl: string;
    asyncThresholdDays: number;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'transaction_reports',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
  report: {
    expiryDays: parseInt(process.env.REPORT_EXPIRY_DAYS || '7', 10),
    downloadBaseUrl: process.env.REPORT_DOWNLOAD_BASE_URL || 'https://reports.example.com',
    asyncThresholdDays: parseInt(process.env.ASYNC_REPORT_THRESHOLD_DAYS || '90', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
