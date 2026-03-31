"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const kafka_1 = require("./config/kafka");
const account_balance_repository_1 = require("./repositories/account-balance.repository");
const cache_repository_1 = require("./repositories/cache.repository");
const audit_service_1 = require("./services/audit.service");
const event_service_1 = require("./services/event.service");
const account_balance_service_1 = require("./services/account-balance.service");
const account_balance_controller_1 = require("./controllers/account-balance.controller");
const health_controller_1 = require("./controllers/health.controller");
const logger_1 = require("./utils/logger");
let server = null;
async function bootstrap() {
    try {
        const db = (0, database_1.getDatabase)();
        const redis = await (0, redis_1.getRedisClient)();
        const kafkaProducer = await (0, kafka_1.getKafkaProducer)();
        const accountBalanceRepository = new account_balance_repository_1.AccountBalanceRepository(db);
        const cacheRepository = new cache_repository_1.CacheRepository(redis);
        const auditService = new audit_service_1.AuditService();
        const eventService = new event_service_1.EventService(kafkaProducer);
        const accountBalanceService = new account_balance_service_1.AccountBalanceService(accountBalanceRepository, cacheRepository, auditService, eventService);
        const accountBalanceController = new account_balance_controller_1.AccountBalanceController(accountBalanceService);
        const healthController = new health_controller_1.HealthController();
        const app = (0, app_1.createApp)(accountBalanceController, healthController);
        server = app.listen(config_1.config.port, () => {
            logger_1.logger.info({
                port: config_1.config.port,
                env: config_1.config.env,
            }, 'Account Balance Service started');
        });
        setupGracefulShutdown();
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to start application');
        process.exit(1);
    }
}
function setupGracefulShutdown() {
    const shutdown = async (signal) => {
        logger_1.logger.info({ signal }, 'Received shutdown signal');
        if (server) {
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await (0, kafka_1.closeKafkaProducer)();
                    await (0, redis_1.closeRedisConnection)();
                    await (0, database_1.closeDatabaseConnection)();
                    logger_1.logger.info('All connections closed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error({ error }, 'Error during shutdown');
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        }
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap();
//# sourceMappingURL=index.js.map