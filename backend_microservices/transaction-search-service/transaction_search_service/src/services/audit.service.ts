import { logger } from '../utils/logger';
import { AuditLog } from '../types';
import { getTraceId } from '../utils/context.storage';
import { maskAccountId } from '../utils/mask.util';

export interface IAuditService {
  logSearchAttempt(accountId?: string, userId?: string): void;
  logSearchSuccess(resultCount: number, accountId?: string, userId?: string): void;
  logSearchFailure(error: string, accountId?: string, userId?: string): void;
}

export class AuditService implements IAuditService {
  logSearchAttempt(accountId?: string, userId?: string): void {
    const auditLog: AuditLog = {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      action: 'TRANSACTION_SEARCH_ATTEMPT',
      userId,
      accountId: accountId ? maskAccountId(accountId) : undefined,
      status: 'success',
    };

    logger.info(auditLog, 'Transaction search attempt');
  }

  logSearchSuccess(resultCount: number, accountId?: string, userId?: string): void {
    const auditLog: AuditLog = {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      action: 'TRANSACTION_SEARCH_SUCCESS',
      userId,
      accountId: accountId ? maskAccountId(accountId) : undefined,
      status: 'success',
      details: { resultCount },
    };

    logger.info(auditLog, 'Transaction search successful');
  }

  logSearchFailure(error: string, accountId?: string, userId?: string): void {
    const auditLog: AuditLog = {
      timestamp: new Date().toISOString(),
      traceId: getTraceId(),
      action: 'TRANSACTION_SEARCH_FAILURE',
      userId,
      accountId: accountId ? maskAccountId(accountId) : undefined,
      status: 'failure',
      errorMessage: error,
    };

    logger.warn(auditLog, 'Transaction search failed');
  }
}
