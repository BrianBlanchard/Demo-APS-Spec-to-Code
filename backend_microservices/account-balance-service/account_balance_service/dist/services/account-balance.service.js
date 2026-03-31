"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountBalanceService = void 0;
const error_types_1 = require("../types/error.types");
class AccountBalanceService {
    repository;
    cache;
    auditService;
    eventService;
    constructor(repository, cache, auditService, eventService) {
        this.repository = repository;
        this.cache = cache;
        this.auditService = auditService;
        this.eventService = eventService;
    }
    async getBalance(accountId) {
        const cached = await this.cache.getBalance(accountId);
        if (cached) {
            this.auditService.log({
                action: 'GET_BALANCE',
                accountId,
                details: { source: 'cache' },
                success: true,
            });
            return cached;
        }
        const entity = await this.repository.findByAccountId(accountId);
        if (!entity) {
            this.auditService.log({
                action: 'GET_BALANCE',
                accountId,
                details: { error: 'Account not found' },
                success: false,
            });
            throw new error_types_1.NotFoundError(`Account ${accountId} not found`);
        }
        const balance = {
            accountId: entity.account_id,
            currentBalance: Number(entity.current_balance),
            creditLimit: Number(entity.credit_limit),
            availableCredit: Number(entity.credit_limit) - Number(entity.current_balance),
            cashCreditLimit: Number(entity.cash_credit_limit),
            availableCashCredit: Number(entity.cash_credit_limit) -
                (Number(entity.current_balance) - Number(entity.current_cycle_debit)),
            currentCycleCredit: Number(entity.current_cycle_credit),
            currentCycleDebit: Number(entity.current_cycle_debit),
            cycleStartDate: entity.cycle_start_date.toISOString().split('T')[0],
            cycleEndDate: entity.cycle_end_date.toISOString().split('T')[0],
            lastTransactionDate: entity.last_transaction_date.toISOString(),
            lastUpdatedAt: entity.updated_at.toISOString(),
        };
        await this.cache.setBalance(accountId, balance);
        this.auditService.log({
            action: 'GET_BALANCE',
            accountId,
            details: { source: 'database' },
            success: true,
        });
        return balance;
    }
    async updateBalance(accountId, request) {
        const entity = await this.repository.findByAccountId(accountId);
        if (!entity) {
            this.auditService.log({
                action: 'UPDATE_BALANCE',
                accountId,
                details: { error: 'Account not found', transactionId: request.transactionId },
                success: false,
            });
            throw new error_types_1.NotFoundError(`Account ${accountId} not found`);
        }
        if (request.isDebit) {
            const availableCredit = Number(entity.credit_limit) - Number(entity.current_balance);
            if (request.amount > availableCredit) {
                this.auditService.log({
                    action: 'UPDATE_BALANCE',
                    accountId,
                    details: {
                        error: 'Insufficient credit',
                        available: availableCredit,
                        requested: request.amount,
                        transactionId: request.transactionId,
                    },
                    success: false,
                });
                throw new error_types_1.ConflictError(`Insufficient credit. Available: $${availableCredit.toFixed(2)}, Requested: $${request.amount.toFixed(2)}`);
            }
        }
        const { previous, current } = await this.repository.updateBalance(accountId, request.amount, request.isDebit, request.transactionId, request.transactionType);
        await this.cache.invalidateBalance(accountId);
        const response = {
            accountId,
            previousBalance: Number(previous),
            newBalance: Number(current),
            transactionId: request.transactionId,
            availableCredit: Number(entity.credit_limit) - Number(current),
            updatedAt: new Date().toISOString(),
        };
        await this.eventService.publishBalanceUpdated({
            accountId,
            previousBalance: Number(previous),
            newBalance: Number(current),
            transactionId: request.transactionId,
            timestamp: response.updatedAt,
        });
        this.auditService.log({
            action: 'UPDATE_BALANCE',
            accountId,
            details: {
                transactionId: request.transactionId,
                previousBalance: previous,
                newBalance: current,
            },
            success: true,
        });
        return response;
    }
}
exports.AccountBalanceService = AccountBalanceService;
//# sourceMappingURL=account-balance.service.js.map