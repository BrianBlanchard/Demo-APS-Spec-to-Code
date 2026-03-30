import { createClient } from 'redis';
import { config } from './index';
import { logger } from '../utils/logger';

export type RedisClient = ReturnType<typeof createClient>;

export const createRedisClient = (): RedisClient => {
  const client = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
  });

  client.on('error', (err) => {
    logger.error({ err }, 'Redis client error');
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  return client;
};

let redisInstance: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (!redisInstance) {
    redisInstance = createRedisClient();
    await redisInstance.connect();
  }
  return redisInstance;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
};
