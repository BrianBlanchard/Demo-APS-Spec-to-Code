import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;

export async function initializeCache(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: Number(process.env.REDIS_DB) || 0,
  });

  redisClient.on('error', (err) => {
    logger.error({ error: err.message }, 'Redis client error');
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  await redisClient.connect();
  logger.info('Cache initialized');

  return redisClient;
}

export function getCache(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Cache not initialized. Call initializeCache() first.');
  }
  return redisClient;
}

export async function closeCache(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Cache connection closed');
  }
}
