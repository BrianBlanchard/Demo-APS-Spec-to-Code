"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountBalanceRepository = void 0;
const error_types_1 = require("../types/error.types");
const crypto_1 = require("crypto");
class AccountBalanceRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByAccountId(accountId) {
        const result = await this.db('account_balances')
            .where('account_id', accountId)
            .first();
        return result || null;
    }
    async updateBalance(accountId, amount, isDebit, transactionId, transactionType) {
        return await this.db.transaction(async (trx) => {
            const account = await trx('account_balances')
                .where('account_id', accountId)
                .forUpdate()
                .timeout(5000)
                .first();
            if (!account) {
                throw new error_types_1.NotFoundError(`Account ${accountId} not found`);
            }
            const previousBalance = account.current_balance;
            const balanceChange = isDebit ? amount : -amount;
            const newBalance = previousBalance + balanceChange;
            const cycleField = isDebit ? 'current_cycle_debit' : 'current_cycle_credit';
            const cycleUpdate = isDebit
                ? account.current_cycle_debit + amount
                : account.current_cycle_credit + amount;
            await trx('account_balances')
                .where('account_id', accountId)
                .update({
                current_balance: newBalance,
                [cycleField]: cycleUpdate,
                last_transaction_date: trx.fn.now(),
                updated_at: trx.fn.now(),
                version: account.version + 1,
            });
            await this.recordBalanceHistory({
                account_id: accountId,
                transaction_id: transactionId,
                previous_balance: previousBalance,
                new_balance: newBalance,
                amount,
                transaction_type: transactionType,
                recorded_at: new Date(),
            }, trx);
            return { previous: previousBalance, current: newBalance };
        });
    }
    async recordBalanceHistory(history, trx) {
        const query = trx || this.db;
        await query('balance_history').insert({
            history_id: (0, crypto_1.randomUUID)(),
            ...history,
        });
    }
}
exports.AccountBalanceRepository = AccountBalanceRepository;
//# sourceMappingURL=account-balance.repository.js.map