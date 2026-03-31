"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.validateParams = void 0;
const zod_1 = require("zod");
const error_types_1 = require("../types/error.types");
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new error_types_1.ValidationError(message);
            }
            throw error;
        }
    };
};
exports.validateParams = validateParams;
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new error_types_1.ValidationError(message);
            }
            throw error;
        }
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=validation.middleware.js.map