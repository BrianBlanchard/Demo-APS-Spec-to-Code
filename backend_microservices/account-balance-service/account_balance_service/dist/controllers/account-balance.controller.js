"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountBalanceController = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const dto_1 = require("../types/dto");
class AccountBalanceController {
    service;
    router;
    constructor(service) {
        this.service = service;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/accounts/:accountId/balance', auth_middleware_1.jwtAuthMiddleware, (0, validation_middleware_1.validateParams)(dto_1.AccountIdParamSchema), this.getBalance.bind(this));
        this.router.post('/accounts/:accountId/balance/update', auth_middleware_1.internalServiceAuthMiddleware, (0, validation_middleware_1.validateParams)(dto_1.AccountIdParamSchema), (0, validation_middleware_1.validateBody)(dto_1.BalanceUpdateRequestSchema), this.updateBalance.bind(this));
    }
    async getBalance(req, res, next) {
        try {
            const { accountId } = req.params;
            const balance = await this.service.getBalance(accountId);
            res.status(200).json(balance);
        }
        catch (error) {
            next(error);
        }
    }
    async updateBalance(req, res, next) {
        try {
            const { accountId } = req.params;
            const response = await this.service.updateBalance(accountId, req.body);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AccountBalanceController = AccountBalanceController;
//# sourceMappingURL=account-balance.controller.js.map