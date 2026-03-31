"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'account_balance',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        ttl: parseInt(process.env.REDIS_TTL || '30', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        issuer: process.env.JWT_ISSUER || 'account-balance-service',
    },
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID || 'account-balance-service',
        topicBalanceUpdated: process.env.KAFKA_TOPIC_BALANCE_UPDATED || 'balance-updated',
    },
    api: {
        timeoutBalanceRetrieval: parseInt(process.env.API_TIMEOUT_BALANCE_RETRIEVAL || '2000', 10),
        timeoutBalanceUpdate: parseInt(process.env.API_TIMEOUT_BALANCE_UPDATE || '5000', 10),
        rateLimitPublic: parseInt(process.env.RATE_LIMIT_PUBLIC || '1000', 10),
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
};
//# sourceMappingURL=index.js.map