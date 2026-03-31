"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const logger_1 = require("../utils/logger");
class AuditService {
    log(entry) {
        const maskedDetails = this.maskSensitiveData(entry.details);
        logger_1.logger.info({
            audit: {
                action: entry.action,
                accountId: this.maskAccountId(entry.accountId),
                details: maskedDetails,
                success: entry.success,
            },
        }, 'Audit log');
    }
    maskAccountId(accountId) {
        if (accountId.length <= 4) {
            return '***';
        }
        return '***' + accountId.slice(-4);
    }
    maskSensitiveData(details) {
        const masked = {};
        for (const [key, value] of Object.entries(details)) {
            if (key.toLowerCase().includes('id') && typeof value === 'string') {
                masked[key] = this.maskAccountId(value);
            }
            else if ((key.toLowerCase().includes('balance') ||
                key.toLowerCase().includes('amount') ||
                key.toLowerCase().includes('credit')) &&
                typeof value === 'number') {
                masked[key] = '***';
            }
            else {
                masked[key] = value;
            }
        }
        return masked;
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map