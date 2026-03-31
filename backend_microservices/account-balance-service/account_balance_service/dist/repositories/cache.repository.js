"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheRepository = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class CacheRepository {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async getBalance(accountId) {
        try {
            const cached = await this.redis.get(`balance:${accountId}`);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        }
        catch (error) {
            logger_1.logger.warn({ error, accountId }, 'Cache get failed, continuing without cache');
            return null;
        }
    }
    async setBalance(accountId, balance) {
        try {
            await this.redis.setEx(`balance:${accountId}`, config_1.config.redis.ttl, JSON.stringify(balance));
        }
        catch (error) {
            logger_1.logger.warn({ error, accountId }, 'Cache set failed, continuing without cache');
        }
    }
    async invalidateBalance(accountId) {
        try {
            await this.redis.del(`balance:${accountId}`);
        }
        catch (error) {
            logger_1.logger.warn({ error, accountId }, 'Cache invalidation failed');
        }
    }
}
exports.CacheRepository = CacheRepository;
//# sourceMappingURL=cache.repository.js.map