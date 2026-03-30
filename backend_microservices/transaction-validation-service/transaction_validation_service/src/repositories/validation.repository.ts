import { Knex } from 'knex';
import { ValidationLog, ValidationResult, DeclineReason } from '../models/validation.model';
import { DatabaseError } from '../errors/custom.errors';
import { logger } from '../config/logger.config';

interface ValidationLogDbRow {
  validation_id: string;
  card_number: string;
  account_id: string;
  amount: number;
  validation_result: ValidationResult;
  decline_reason: DeclineReason | null;
  authorization_code: string | null;
  merchant_id: string;
  transaction_type: string;
  validated_at: Date;
  response_time_ms: number;
  cvv_provided: boolean;
  cvv_match: boolean | null;
}

export interface IValidationRepository {
  saveValidationLog(log: ValidationLog): Promise<void>;
  findRecentTransactions(
    cardNumber: string,
    merchantId: string,
    amount: number,
    windowSeconds: number
  ): Promise<ValidationLog[]>;
}

export class ValidationRepository implements IValidationRepository {
  constructor(private readonly db: Knex) {}

  async saveValidationLog(log: ValidationLog): Promise<void> {
    try {
      await this.db('transaction_validations').insert({
        validation_id: log.validationId,
        card_number: log.cardNumber,
        account_id: log.accountId,
        amount: log.amount,
        validation_result: log.validationResult,
        decline_reason: log.declineReason,
        authorization_code: log.authorizationCode,
        merchant_id: log.merchantId,
        transaction_type: log.transactionType,
        validated_at: log.validatedAt,
        response_time_ms: log.responseTimeMs,
        cvv_provided: log.cvvProvided,
        cvv_match: log.cvvMatch,
      });
    } catch (error) {
      logger.error({ error, validationId: log.validationId }, 'Failed to save validation log');
      throw new DatabaseError('Failed to save validation log');
    }
  }

  async findRecentTransactions(
    cardNumber: string,
    merchantId: string,
    amount: number,
    windowSeconds: number
  ): Promise<ValidationLog[]> {
    try {
      const cutoffTime = new Date(Date.now() - windowSeconds * 1000);

      const results = await this.db<ValidationLogDbRow>('transaction_validations')
        .where({
          card_number: cardNumber,
          merchant_id: merchantId,
          amount: amount,
        })
        .andWhere('validated_at', '>=', cutoffTime)
        .select('*');

      return results.map((result) => ({
        validationId: result.validation_id,
        cardNumber: result.card_number,
        accountId: result.account_id,
        amount: result.amount,
        validationResult: result.validation_result,
        declineReason: result.decline_reason,
        authorizationCode: result.authorization_code,
        merchantId: result.merchant_id,
        transactionType: result.transaction_type,
        validatedAt: result.validated_at,
        responseTimeMs: result.response_time_ms,
        cvvProvided: result.cvv_provided,
        cvvMatch: result.cvv_match,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch recent transactions');
      throw new DatabaseError('Failed to fetch recent transactions');
    }
  }
}
