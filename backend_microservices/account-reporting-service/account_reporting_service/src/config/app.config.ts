import * as dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  logLevel: string;
  corsOrigin: string;
  reportBaseUrl: string;
  reportStoragePath: string;
}

export function getAppConfig(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    reportBaseUrl: process.env.REPORT_BASE_URL || 'https://reports.example.com',
    reportStoragePath: process.env.REPORT_STORAGE_PATH || '/tmp/reports',
  };
}
