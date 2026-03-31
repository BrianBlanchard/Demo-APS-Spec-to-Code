"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const error_types_1 = require("../types/error.types");
const logger_1 = require("../utils/logger");
const async_context_1 = require("../utils/async-context");
const errorMiddleware = (err, req, res, _next) => {
    const context = async_context_1.asyncLocalStorage.getStore();
    const traceId = context?.traceId || 'unknown';
    let appError;
    if (err instanceof error_types_1.AppError) {
        appError = err;
    }
    else {
        appError = new error_types_1.InternalServerError(err.message || 'An unexpected error occurred');
    }
    logger_1.logger.error({
        err: {
            message: appError.message,
            statusCode: appError.statusCode,
            errorCode: appError.errorCode,
            stack: appError.isOperational ? undefined : appError.stack,
        },
        traceId,
        path: req.path,
        method: req.method,
    }, 'Request error');
    const errorResponse = {
        errorCode: appError.errorCode,
        message: appError.message,
        timestamp: new Date().toISOString(),
        traceId,
    };
    if (appError.statusCode === 423) {
        res.setHeader('Retry-After', '5');
    }
    res.status(appError.statusCode).json(errorResponse);
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map