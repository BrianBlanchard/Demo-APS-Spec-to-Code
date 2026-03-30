import { Knex } from 'knex';
import { PostTransactionRequest, PostTransactionResponse } from '../dto/transaction.dto';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AccountRepository } from '../repositories/account.repository';
import { ValidationRepository } from '../repositories/validation.repository';
import { CardRepository, CardStatus } from '../repositories/card.repository';
import { AuditService } from './audit.service';
import { EventPublisher } from './event-publisher.service';
import {
  ValidationNotFoundError,
  AuthorizationMismatchError,
  AccountInactiveError,
  CardInactiveError,
  AmountMismatchError,
  DuplicateTransactionError,
} from '../utils/errors';
import { TransactionStatus, AccountStatus, ValidationStatus, BalanceUpdate } from '../models/transaction.model';

export interface TransactionService {
  postTransaction(request: PostTransactionRequest): Promise<PostTransactionResponse>;
}

export class TransactionServiceImpl implements TransactionService {
  constructor(
    private db: Knex,
    private transactionRepository: TransactionRepository,
    private accountRepository: AccountRepository,
    private validationRepository: ValidationRepository,
    private cardRepository: CardRepository,
    private auditService: AuditService,
    private eventPublisher: EventPublisher,
  ) {}

  async postTransaction(request: PostTransactionRequest): Promise<PostTransactionResponse> {
    // Check for duplicate transaction first (outside main transaction)
    const existingTransaction = await this.transactionRepository.findByValidationId(request.validationId);
    if (existingTransaction) {
      throw new DuplicateTransactionError(request.validationId, existingTransaction.transactionId);
    }

    let response: PostTransactionResponse;

    try {
      response = await this.db.transaction(async (trx) => {
        // 1. Validate authorization code matches validation record
        const validation = await this.validationRepository.findById(request.validationId, trx);
        if (!validation) {
          throw new ValidationNotFoundError(request.validationId);
        }

        if (validation.status !== ValidationStatus.APPROVED) {
          throw new ValidationNotFoundError(request.validationId);
        }

        if (validation.authorizationCode !== request.authorizationCode) {
          throw new AuthorizationMismatchError();
        }

        if (Math.abs(validation.amount - request.amount) > 0.01) {
          throw new AmountMismatchError();
        }

        // 2. Verify card is still active
        const card = await this.cardRepository.findByCardNumber(request.cardNumber, trx);
        if (!card || card.status !== CardStatus.ACTIVE) {
          throw new CardInactiveError(request.cardNumber);
        }

        // 3. Retrieve and lock account
        const account = await this.accountRepository.findByCardNumber(request.cardNumber, trx);
        if (!account) {
          throw new AccountInactiveError('unknown');
        }

        if (account.status !== AccountStatus.ACTIVE) {
          throw new AccountInactiveError(account.accountId);
        }

        // 4. Generate unique transaction ID
        const transactionId = await this.transactionRepository.generateTransactionId(trx);

        // 5. Determine if debit or credit and calculate new balance
        const isDebit = ['01', '03', '04', '05'].includes(request.transactionType);
        const isCredit = request.transactionType === '02';

        const previousBalance = account.currentBalance;
        let newBalance: number;
        let transactionAmount: number;

        if (isDebit) {
          // Debit increases the balance (amount owed)
          transactionAmount = request.amount;
          newBalance = previousBalance + transactionAmount;
        } else if (isCredit) {
          // Credit decreases the balance (payment)
          transactionAmount = -request.amount;
          newBalance = previousBalance + transactionAmount; // Adding negative = subtraction
        } else {
          // Adjustment - can be either
          transactionAmount = request.amount;
          newBalance = previousBalance + transactionAmount;
        }

        // 6. Create transaction record
        const transaction = await this.transactionRepository.create(
          {
            transactionId,
            cardNumber: request.cardNumber,
            accountId: account.accountId,
            transactionType: request.transactionType,
            transactionCategory: request.transactionCategory,
            transactionAmount,
            merchantId: request.merchantId,
            merchantName: request.merchantName,
            merchantCity: request.merchantCity,
            merchantZip: request.merchantZip,
            transactionSource: request.transactionSource,
            transactionDescription: request.transactionDescription,
            originalTimestamp: new Date(request.originalTimestamp),
            authorizationCode: request.authorizationCode,
            validationId: request.validationId,
            status: TransactionStatus.POSTED,
          },
          trx,
        );

        // 7. Update account balance
        const balanceUpdate: BalanceUpdate = {
          accountId: account.accountId,
          previousBalance,
          newBalance,
          availableCredit: account.creditLimit - newBalance,
          transactionAmount,
          transactionType: request.transactionType,
        };

        const updatedAccount = await this.accountRepository.updateBalance(balanceUpdate, trx);

        // 8. Build response
        const postResponse: PostTransactionResponse = {
          transactionId: transaction.transactionId,
          accountId: transaction.accountId,
          cardNumber: this.maskCardNumber(transaction.cardNumber),
          transactionType: transaction.transactionType,
          transactionCategory: transaction.transactionCategory,
          amount: request.amount,
          transactionDescription: transaction.transactionDescription,
          merchantName: transaction.merchantName,
          merchantCity: transaction.merchantCity,
          originalTimestamp: transaction.originalTimestamp.toISOString(),
          postedTimestamp: transaction.postedTimestamp.toISOString(),
          previousBalance,
          newBalance,
          availableCredit: updatedAccount.availableCredit,
          status: transaction.status,
        };

        // Audit log within transaction
        this.auditService.log({
          operation: 'POST_TRANSACTION',
          status: 'success',
          details: {
            transactionId: transaction.transactionId,
            accountId: transaction.accountId,
            cardNumber: request.cardNumber,
            amount: request.amount,
            merchantName: request.merchantName,
          },
        });

        return postResponse;
      });

      // 9. Publish event (outside transaction, eventually consistent)
      const transaction = await this.transactionRepository.findById(response.transactionId);
      if (transaction) {
        await this.eventPublisher.publishTransactionPosted(
          transaction,
          response.previousBalance,
          response.newBalance,
        );
      }

      return response;
    } catch (error) {
      this.auditService.log({
        operation: 'POST_TRANSACTION',
        status: 'failure',
        details: {
          validationId: request.validationId,
          error: (error as Error).message,
        },
      });

      throw error;
    }
  }

  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length !== 16) {
      return '****';
    }
    return `************${cardNumber.slice(-4)}`;
  }
}
