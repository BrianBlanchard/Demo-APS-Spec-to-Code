import { createClient } from 'redis';
export type RedisClient = ReturnType<typeof createClient>;
export declare const createRedisClient: () => RedisClient;
export declare const getRedisClient: () => Promise<RedisClient>;
export declare const closeRedisConnection: () => Promise<void>;
//# sourceMappingURL=redis.d.ts.map