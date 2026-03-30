import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  node_env: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(3000),

  db: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().positive().default(5432),
    database: z.string().default('customer_search_db'),
    user: z.string().default('postgres'),
    password: z.string().default('postgres'),
    pool: z.object({
      min: z.coerce.number().int().nonnegative().default(2),
      max: z.coerce.number().int().positive().default(10),
    }),
  }),

  elasticsearch: z.object({
    node: z.string().url().default('http://localhost:9200'),
    index: z.string().default('customer_profiles'),
    requestTimeout: z.coerce.number().int().positive().default(2000),
  }),

  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().positive().default(6379),
    password: z.string().optional(),
    ttl: z.coerce.number().int().positive().default(60),
  }),

  security: z.object({
    jwtSecret: z.string().min(1),
  }),

  rateLimit: z.object({
    windowMs: z.coerce.number().int().positive().default(60000),
    maxRequests: z.coerce.number().int().positive().default(60),
  }),

  logging: z.object({
    level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  }),

  cors: z.object({
    origin: z.string().default('*'),
  }),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const rawConfig = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,

    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      pool: {
        min: process.env.DB_POOL_MIN,
        max: process.env.DB_POOL_MAX,
      },
    },

    elasticsearch: {
      node: process.env.ES_NODE,
      index: process.env.ES_INDEX,
      requestTimeout: process.env.ES_REQUEST_TIMEOUT,
    },

    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      ttl: process.env.REDIS_TTL,
    },

    security: {
      jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    },

    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    },

    logging: {
      level: process.env.LOG_LEVEL,
    },

    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  };

  const result = configSchema.safeParse(rawConfig);

  if (!result.success) {
    throw new Error(`Configuration validation failed: ${result.error.message}`);
  }

  return result.data;
}

export const config = loadConfig();
