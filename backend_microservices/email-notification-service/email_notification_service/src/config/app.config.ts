import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  env: string;
  port: number;
  logLevel: string;
  cors: {
    origin: string;
    credentials: boolean;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  pool: {
    min: number;
    max: number;
  };
}

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailConfig {
  retryAttempts: number;
  retryDelayMs: number;
}

export const appConfig: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'email_notification_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
};

export const sendGridConfig: SendGridConfig = {
  apiKey: process.env.SENDGRID_API_KEY || '',
  fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
  fromName: process.env.SENDGRID_FROM_NAME || 'Email Notification Service',
};

export const emailConfig: EmailConfig = {
  retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.EMAIL_RETRY_DELAY_MS || '1000', 10),
};
