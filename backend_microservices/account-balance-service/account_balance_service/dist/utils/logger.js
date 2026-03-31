"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const config_1 = require("../config");
const async_context_1 = require("./async-context");
exports.logger = (0, pino_1.default)({
    level: config_1.config.logLevel,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    mixin() {
        const context = async_context_1.asyncLocalStorage.getStore();
        return context ? { traceId: context.traceId } : {};
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
//# sourceMappingURL=logger.js.map