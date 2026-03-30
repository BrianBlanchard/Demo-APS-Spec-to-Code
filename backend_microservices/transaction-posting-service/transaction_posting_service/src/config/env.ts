import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'transaction_posting',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'transaction-posting-service',
    topicTransactionPosted: process.env.KAFKA_TOPIC_TRANSACTION_POSTED || 'transaction.posted',
  },
  auth: {
    serviceToken: process.env.SERVICE_TOKEN || 'your-internal-service-token-here',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  cors: {
    allowAll: process.env.CORS_ALLOW_ALL === 'true',
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  },
  rateLimit: {
    transactions: parseInt(process.env.RATE_LIMIT_TRANSACTIONS || '5000', 10),
  },
} as const;
