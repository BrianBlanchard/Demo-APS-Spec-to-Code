import { ValidateTransactionRequest } from '../dtos/validate-transaction.dto';
import {
  ValidationResponse,
  ValidationApprovedResponse,
  ValidationDeclinedResponse,
  DeclineReasonDescriptions,
} from '../dtos/validation-response.dto';
import { ICardRepository } from '../repositories/card.repository';
import { IAccountRepository } from '../repositories/account.repository';
import { IValidationRepository } from '../repositories/validation.repository';
import { ICacheService } from './cache.service';
import { IAuditService } from './audit.service';
import { validateLuhn } from '../utils/luhn.util';
import { maskCardNumber } from '../utils/mask.util';
import { generateValidationId, generateAuthorizationCode } from '../utils/id-generator.util';
import {
  ValidationResult,
  DeclineReason,
  ValidationCheck,
  ValidationLog,
} from '../models/validation.model';
import { CardStatus } from '../models/card.model';
import { AccountStatus } from '../models/account.model';
import { TransactionType, TransactionSource } from '../models/transaction.model';
import { ValidationError, CardNotFoundError } from '../errors/custom.errors';
import { envConfig } from '../config/env.config';

export interface ITransactionValidationService {
  validateTransaction(request: ValidateTransactionRequest): Promise<ValidationResponse>;
}

export class TransactionValidationService implements ITransactionValidationService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly validationRepository: IValidationRepository,
    private readonly cacheService: ICacheService,
    private readonly auditService: IAuditService
  ) {}

  async validateTransaction(request: ValidateTransactionRequest): Promise<ValidationResponse> {
    const startTime = Date.now();
    const validationId = generateValidationId();
    const checks: ValidationCheck[] = [];

    try {
      this.auditService.logValidationRequest(request);

      // Validate card number format (Luhn algorithm)
      if (!validateLuhn(request.cardNumber)) {
        throw new ValidationError('Invalid card number (Luhn check failed)');
      }

      // Check CVV requirement for online transactions
      if (request.transactionSource === TransactionSource.ONLINE && !request.cvv) {
        throw new ValidationError('CVV is required for online transactions');
      }

      // Retrieve card (check cache first)
      let card = await this.cacheService.getCard(request.cardNumber);
      if (!card) {
        card = await this.cardRepository.findByCardNumber(request.cardNumber);
        if (!card) {
          throw new CardNotFoundError('Card not found');
        }
        await this.cacheService.setCard(request.cardNumber, card);
      }

      // Check if card is expired
      const transactionDate = new Date(request.transactionTimestamp);
      if (transactionDate > card.expirationDate) {
        const response = this.buildDeclinedResponse(
          validationId,
          request,
          card.accountId,
          0,
          DeclineReason.EXPIRED_CARD,
          [
            { check: 'card_expiration', result: 'fail', details: 'Card is past expiration date' },
          ]
        );
        await this.saveValidationLog(
          validationId,
          request,
          card.accountId,
          response,
          Date.now() - startTime
        );
        return response;
      }
      checks.push({ check: 'card_expiration', result: 'pass' });

      // Validate card is active
      if (card.status !== CardStatus.ACTIVE) {
        const response = this.buildDeclinedResponse(
          validationId,
          request,
          card.accountId,
          0,
          DeclineReason.CARD_INACTIVE,
          [{ check: 'card_active', result: 'fail', details: `Card status: ${card.status}` }]
        );
        await this.saveValidationLog(
          validationId,
          request,
          card.accountId,
          response,
          Date.now() - startTime
        );
        return response;
      }
      checks.push({ check: 'card_active', result: 'pass' });

      // Retrieve account
      let account = await this.cacheService.getAccount(card.accountId);
      if (!account) {
        account = await this.accountRepository.findByAccountId(card.accountId);
        if (!account) {
          throw new ValidationError('Account not found');
        }
        await this.cacheService.setAccount(card.accountId, account);
      }

      // Validate account is active
      if (account.status !== AccountStatus.ACTIVE) {
        const response = this.buildDeclinedResponse(
          validationId,
          request,
          card.accountId,
          account.availableCredit,
          DeclineReason.ACCOUNT_INACTIVE,
          [
            ...checks,
            {
              check: 'account_active',
              result: 'fail',
              details: `Account status: ${account.status}`,
            },
          ]
        );
        await this.saveValidationLog(
          validationId,
          request,
          card.accountId,
          response,
          Date.now() - startTime
        );
        return response;
      }
      checks.push({ check: 'account_active', result: 'pass' });

      // Check CVV if provided
      if (request.cvv) {
        const cvvMatch = request.cvv === card.cvv;
        if (!cvvMatch) {
          const failureCount = await this.cardRepository.incrementCvvFailureCount(
            request.cardNumber
          );

          // Suspend card after max failures
          if (failureCount >= envConfig.validation.cvvMaxFailures) {
            // In production, this would trigger a card suspension workflow
          }

          const response = this.buildDeclinedResponse(
            validationId,
            request,
            card.accountId,
            account.availableCredit,
            DeclineReason.INVALID_CVV,
            [
              ...checks,
              {
                check: 'cvv_match',
                result: 'fail',
                details: `CVV does not match (failures: ${failureCount})`,
              },
            ]
          );
          await this.saveValidationLog(
            validationId,
            request,
            card.accountId,
            response,
            Date.now() - startTime
          );
          return response;
        }
        checks.push({ check: 'cvv_match', result: 'pass' });
      }

      // Check for sufficient credit
      if (request.transactionType === TransactionType.PURCHASE) {
        if (request.amount > account.availableCredit) {
          const response = this.buildDeclinedResponse(
            validationId,
            request,
            card.accountId,
            account.availableCredit,
            DeclineReason.INSUFFICIENT_CREDIT,
            [
              ...checks,
              {
                check: 'sufficient_credit',
                result: 'fail',
                details: `Required: ${request.amount}, Available: ${account.availableCredit}`,
              },
            ]
          );
          await this.saveValidationLog(
            validationId,
            request,
            card.accountId,
            response,
            Date.now() - startTime
          );
          return response;
        }
      } else if (request.transactionType === TransactionType.CASH_ADVANCE) {
        if (request.amount > account.availableCashCredit) {
          const response = this.buildDeclinedResponse(
            validationId,
            request,
            card.accountId,
            account.availableCredit,
            DeclineReason.INSUFFICIENT_CREDIT,
            [
              ...checks,
              {
                check: 'sufficient_cash_credit',
                result: 'fail',
                details: `Required: ${request.amount}, Available cash: ${account.availableCashCredit}`,
              },
            ]
          );
          await this.saveValidationLog(
            validationId,
            request,
            card.accountId,
            response,
            Date.now() - startTime
          );
          return response;
        }
      }
      checks.push({ check: 'sufficient_credit', result: 'pass' });

      // Check daily transaction limits
      const today = new Date().toDateString();
      const lastTransactionDate = card.lastTransactionDate
        ? new Date(card.lastTransactionDate).toDateString()
        : null;

      let currentDailyCount = card.dailyTransactionCount;
      if (lastTransactionDate !== today) {
        currentDailyCount = 0;
      }

      if (currentDailyCount >= card.dailyTransactionLimit) {
        const response = this.buildDeclinedResponse(
          validationId,
          request,
          card.accountId,
          account.availableCredit,
          DeclineReason.DAILY_LIMIT_EXCEEDED,
          [
            ...checks,
            {
              check: 'daily_limit',
              result: 'fail',
              details: `Daily limit reached: ${card.dailyTransactionLimit}`,
            },
          ]
        );
        await this.saveValidationLog(
          validationId,
          request,
          card.accountId,
          response,
          Date.now() - startTime
        );
        return response;
      }
      checks.push({ check: 'daily_limit', result: 'pass' });

      // Check for duplicate transactions
      const recentTransactions = await this.validationRepository.findRecentTransactions(
        request.cardNumber,
        request.merchantId,
        request.amount,
        envConfig.validation.duplicateTransactionWindowSeconds
      );

      if (recentTransactions.length > 0) {
        const response = this.buildDeclinedResponse(
          validationId,
          request,
          card.accountId,
          account.availableCredit,
          DeclineReason.DUPLICATE_TRANSACTION,
          [
            ...checks,
            {
              check: 'duplicate_check',
              result: 'fail',
              details: `Similar transaction found within ${envConfig.validation.duplicateTransactionWindowSeconds} seconds`,
            },
          ]
        );
        await this.saveValidationLog(
          validationId,
          request,
          card.accountId,
          response,
          Date.now() - startTime
        );
        return response;
      }
      checks.push({ check: 'duplicate_check', result: 'pass' });

      // All checks passed - approve transaction
      const authorizationCode = generateAuthorizationCode();
      const response: ValidationApprovedResponse = {
        validationId,
        validationResult: ValidationResult.APPROVED,
        cardNumber: maskCardNumber(request.cardNumber),
        accountId: card.accountId,
        amount: request.amount,
        availableCredit: account.availableCredit,
        remainingCreditAfter: account.availableCredit - request.amount,
        authorizationCode,
        timestamp: new Date().toISOString(),
        validationChecks: checks,
      };

      // Update daily transaction count
      await this.cardRepository.updateDailyTransactionCount(
        request.cardNumber,
        currentDailyCount + 1
      );

      // Save validation log
      await this.saveValidationLog(
        validationId,
        request,
        card.accountId,
        response,
        Date.now() - startTime
      );

      this.auditService.logValidationResponse(response, Date.now() - startTime);
      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.auditService.logValidationFailure(error as Error, durationMs);
      throw error;
    }
  }

  private buildDeclinedResponse(
    validationId: string,
    request: ValidateTransactionRequest,
    _accountId: string,
    availableCredit: number,
    declineReason: DeclineReason,
    checks: ValidationCheck[]
  ): ValidationDeclinedResponse {
    const response: ValidationDeclinedResponse = {
      validationId,
      validationResult: ValidationResult.DECLINED,
      declineReason,
      declineReasonDescription: DeclineReasonDescriptions[declineReason],
      cardNumber: maskCardNumber(request.cardNumber),
      amount: request.amount,
      availableCredit,
      timestamp: new Date().toISOString(),
      validationChecks: checks,
    };

    this.auditService.logValidationResponse(response, 0);
    return response;
  }

  private async saveValidationLog(
    validationId: string,
    request: ValidateTransactionRequest,
    accountId: string,
    response: ValidationResponse,
    responseTimeMs: number
  ): Promise<void> {
    const log: ValidationLog = {
      validationId,
      cardNumber: request.cardNumber,
      accountId: accountId,
      amount: request.amount,
      validationResult: response.validationResult,
      declineReason:
        response.validationResult === ValidationResult.DECLINED ? response.declineReason : null,
      authorizationCode:
        response.validationResult === ValidationResult.APPROVED
          ? response.authorizationCode
          : null,
      merchantId: request.merchantId,
      transactionType: request.transactionType,
      validatedAt: new Date(),
      responseTimeMs,
      cvvProvided: !!request.cvv,
      cvvMatch: request.cvv ? true : null,
    };

    await this.validationRepository.saveValidationLog(log);
  }
}
