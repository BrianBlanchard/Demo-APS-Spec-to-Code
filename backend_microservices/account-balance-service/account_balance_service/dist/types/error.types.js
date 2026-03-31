"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ResourceLockedError = exports.ConflictError = exports.NotFoundError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errorCode;
    isOperational;
    constructor(statusCode, errorCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(400, 'VALIDATION_ERROR', message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, 'NOT_FOUND', message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(409, 'CONFLICT', message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
class ResourceLockedError extends AppError {
    constructor(message = 'Resource is locked') {
        super(423, 'RESOURCE_LOCKED', message);
        Object.setPrototypeOf(this, ResourceLockedError.prototype);
    }
}
exports.ResourceLockedError = ResourceLockedError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(500, 'INTERNAL_ERROR', message, false);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=error.types.js.map