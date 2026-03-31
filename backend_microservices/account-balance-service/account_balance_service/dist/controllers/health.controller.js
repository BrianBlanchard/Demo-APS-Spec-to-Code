"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
class HealthController {
    router;
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/health', this.health.bind(this));
        this.router.get('/health/live', this.liveness.bind(this));
        this.router.get('/health/ready', this.readiness.bind(this));
    }
    async health(_req, res) {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'account-balance-service',
        });
    }
    liveness(_req, res) {
        res.status(200).json({
            status: 'alive',
            timestamp: new Date().toISOString(),
        });
    }
    async readiness(_req, res) {
        const checks = {};
        try {
            const db = (0, database_1.getDatabase)();
            await db.raw('SELECT 1');
            checks.database = 'ready';
        }
        catch (error) {
            checks.database = 'not ready';
        }
        try {
            const redis = await (0, redis_1.getRedisClient)();
            await redis.ping();
            checks.redis = 'ready';
        }
        catch (error) {
            checks.redis = 'not ready';
        }
        const isReady = Object.values(checks).every((status) => status === 'ready');
        res.status(isReady ? 200 : 503).json({
            status: isReady ? 'ready' : 'not ready',
            checks,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map