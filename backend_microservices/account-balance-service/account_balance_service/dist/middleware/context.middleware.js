"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = void 0;
const crypto_1 = require("crypto");
const async_context_1 = require("../utils/async-context");
const contextMiddleware = (req, res, next) => {
    const traceId = req.headers['x-trace-id'] || (0, crypto_1.randomUUID)();
    const context = {
        traceId,
        userId: req.headers['x-user-id'],
        timestamp: new Date(),
    };
    res.setHeader('x-trace-id', traceId);
    async_context_1.asyncLocalStorage.run(context, () => {
        next();
    });
};
exports.contextMiddleware = contextMiddleware;
//# sourceMappingURL=context.middleware.js.map