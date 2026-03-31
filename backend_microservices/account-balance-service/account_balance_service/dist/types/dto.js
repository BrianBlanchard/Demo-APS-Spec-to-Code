"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceUpdateRequestSchema = exports.AccountIdParamSchema = void 0;
const zod_1 = require("zod");
const account_types_1 = require("./account.types");
exports.AccountIdParamSchema = zod_1.z.object({
    accountId: zod_1.z.string().length(11, 'Account ID must be exactly 11 digits'),
});
exports.BalanceUpdateRequestSchema = zod_1.z.object({
    transactionId: zod_1.z.string().length(16, 'Transaction ID must be exactly 16 characters'),
    transactionType: zod_1.z.nativeEnum(account_types_1.TransactionType),
    amount: zod_1.z.number().positive('Amount must be positive'),
    isDebit: zod_1.z.boolean(),
    timestamp: zod_1.z.string().datetime(),
});
//# sourceMappingURL=dto.js.map