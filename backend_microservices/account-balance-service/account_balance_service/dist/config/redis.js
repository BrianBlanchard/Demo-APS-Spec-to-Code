"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisConnection = exports.getRedisClient = exports.createRedisClient = void 0;
const redis_1 = require("redis");
const index_1 = require("./index");
const logger_1 = require("../utils/logger");
const createRedisClient = () => {
    const client = (0, redis_1.createClient)({
        socket: {
            host: index_1.config.redis.host,
            port: index_1.config.redis.port,
        },
        password: index_1.config.redis.password,
    });
    client.on('error', (err) => {
        logger_1.logger.error({ err }, 'Redis client error');
    });
    client.on('connect', () => {
        logger_1.logger.info('Redis client connected');
    });
    return client;
};
exports.createRedisClient = createRedisClient;
let redisInstance = null;
const getRedisClient = async () => {
    if (!redisInstance) {
        redisInstance = (0, exports.createRedisClient)();
        await redisInstance.connect();
    }
    return redisInstance;
};
exports.getRedisClient = getRedisClient;
const closeRedisConnection = async () => {
    if (redisInstance) {
        await redisInstance.quit();
        redisInstance = null;
    }
};
exports.closeRedisConnection = closeRedisConnection;
//# sourceMappingURL=redis.js.map