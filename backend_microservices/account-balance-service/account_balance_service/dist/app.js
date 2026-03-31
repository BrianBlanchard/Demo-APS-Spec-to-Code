"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const context_middleware_1 = require("./middleware/context.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const createApp = (accountBalanceController, healthController) => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: config_1.config.cors.origin }));
    app.use(express_1.default.json());
    app.use(context_middleware_1.contextMiddleware);
    app.use('/api/v1', accountBalanceController.router);
    app.use('/', healthController.router);
    app.use(error_middleware_1.errorMiddleware);
    logger_1.logger.info('Express application configured');
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map