import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'card_lookup_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: Number(process.env.DB_POOL_MIN) || 2,
    poolMax: Number(process.env.DB_POOL_MAX) || 10,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
    ttl: Number(process.env.CACHE_TTL_SECONDS) || 120,
  },
  api: {
    timeout: Number(process.env.API_TIMEOUT_MS) || 3000,
    rateLimit: {
      requests: Number(process.env.RATE_LIMIT_REQUESTS) || 500,
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  },
};
