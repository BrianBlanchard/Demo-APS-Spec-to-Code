import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  app: {
    port: number;
    nodeEnv: string;
    corsOrigins: string[];
  };
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    pool: {
      min: number;
      max: number;
    };
  };
  twilio: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
  retry: {
    maxAttempts: number;
    delayMs: number;
  };
  email: {
    enabled: boolean;
    fallbackEnabled: boolean;
  };
}

export const config: Config = {
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins:
      process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGINS || '').split(',')
        : ['*'],
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'sms_notification_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || '',
  },
  retry: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '1', 10),
    delayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    fallbackEnabled: process.env.EMAIL_FALLBACK_ENABLED === 'true',
  },
};

export function validateConfig(): void {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_FROM_NUMBER',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
