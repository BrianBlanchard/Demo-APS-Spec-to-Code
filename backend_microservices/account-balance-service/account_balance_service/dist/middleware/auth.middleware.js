"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServiceAuthMiddleware = exports.jwtAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const error_types_1 = require("../types/error.types");
const jwtAuthMiddleware = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new error_types_1.UnauthorizedError('Missing or invalid authorization header');
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret, {
            issuer: config_1.config.jwt.issuer,
        });
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new error_types_1.UnauthorizedError('Invalid or expired token');
    }
};
exports.jwtAuthMiddleware = jwtAuthMiddleware;
const internalServiceAuthMiddleware = (req, _res, next) => {
    const serviceToken = req.headers['x-service-token'];
    if (!serviceToken || serviceToken !== config_1.config.jwt.secret) {
        throw new error_types_1.UnauthorizedError('Invalid service token');
    }
    next();
};
exports.internalServiceAuthMiddleware = internalServiceAuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map