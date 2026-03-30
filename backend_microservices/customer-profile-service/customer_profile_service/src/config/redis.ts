import { createClient, RedisClientType } from 'redis';
import { config } from './index';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;

export async function initRedis(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db,
  });

  redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis client error');
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  await redisClient.connect();

  return redisClient;
}

export function getRedis(): RedisClientType {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis not initialized or not connected. Call initRedis() first.');
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
