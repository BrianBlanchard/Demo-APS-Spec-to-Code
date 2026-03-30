import { createClient } from 'redis';
import { envConfig } from './env.config';
import { logger } from './logger.config';

export class RedisConfig {
  private static instance: ReturnType<typeof createClient> | null = null;

  static async getInstance(): Promise<ReturnType<typeof createClient>> {
    if (!RedisConfig.instance) {
      const client = createClient({
        socket: {
          host: envConfig.redis.host,
          port: envConfig.redis.port,
        },
        password: envConfig.redis.password || undefined,
        database: envConfig.redis.db,
      });

      client.on('error', (err) => {
        logger.error({ err }, 'Redis client error');
      });

      client.on('connect', () => {
        logger.info('Redis client connected');
      });

      await client.connect();
      RedisConfig.instance = client;
    }
    return RedisConfig.instance;
  }

  static async closeConnection(): Promise<void> {
    if (RedisConfig.instance) {
      await RedisConfig.instance.quit();
      RedisConfig.instance = null;
    }
  }
}
