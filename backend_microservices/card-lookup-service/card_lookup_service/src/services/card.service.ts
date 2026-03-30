import { ICardRepository } from '../repositories/card.repository';
import { IAccountRepository } from '../repositories/account.repository';
import { ICustomerRepository } from '../repositories/customer.repository';
import { ITransactionRepository } from '../repositories/transaction.repository';
import { IMaskingService } from './masking.service';
import { IAuditService } from './audit.service';
import { ICacheService } from './cache.service';
import { CardResponseDto } from '../dtos/card-response.dto';
import { NotFoundException } from '../exceptions/not-found.exception';
import { ForbiddenException } from '../exceptions/forbidden.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { UserRole } from '../types/user-role.type';

export interface ICardService {
  getCardByNumber(
    cardNumber: string,
    userId: string,
    userRole: UserRole,
    includeAccount: boolean,
    includeCustomer: boolean,
    includeTransactions: boolean
  ): Promise<CardResponseDto>;
}

export class CardService implements ICardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly maskingService: IMaskingService,
    private readonly auditService: IAuditService,
    private readonly cacheService: ICacheService
  ) {}

  async getCardByNumber(
    cardNumber: string,
    userId: string,
    userRole: UserRole,
    includeAccount: boolean,
    includeCustomer: boolean,
    includeTransactions: boolean
  ): Promise<CardResponseDto> {
    // Validate card number format
    const cleanCardNumber = this.extractCardNumber(cardNumber);
    this.validateCardNumber(cleanCardNumber);

    // Check cache first
    const cacheKey = `card:${cleanCardNumber}:${includeAccount}:${includeCustomer}:${includeTransactions}`;
    const cachedCard = await this.cacheService.get<CardResponseDto>(cacheKey);
    if (cachedCard) {
      // Re-mask based on current user role
      cachedCard.cardNumber = this.maskingService.maskCardNumber(cleanCardNumber, userRole);
      this.auditService.logCardAccess(cleanCardNumber, userId, userRole, true, 'Cache hit');
      return cachedCard;
    }

    // Retrieve card from database
    const card = await this.cardRepository.findByCardNumber(cleanCardNumber);

    if (!card) {
      this.auditService.logCardAccess(cleanCardNumber, userId, userRole, false, 'Card not found');
      throw new NotFoundException('Card not found');
    }

    // Check if user has permission to view this card
    this.checkPermission(card.customerId, userId, userRole);

    // Build response
    const response: CardResponseDto = {
      cardNumber: this.maskingService.maskCardNumber(card.cardNumber, userRole),
      accountId: card.accountId,
      customerId: card.customerId,
      embossedName: card.embossedName,
      status: card.status,
      expirationDate: card.expirationDate,
      issuedDate: card.issuedDate,
    };

    // Load optional data
    if (includeAccount) {
      const account = await this.accountRepository.findByAccountId(card.accountId);
      if (account) {
        response.account = {
          accountId: account.accountId,
          status: account.status,
          currentBalance: account.currentBalance,
          creditLimit: account.creditLimit,
          availableCredit: account.availableCredit,
        };
      }
    }

    if (includeCustomer) {
      const customer = await this.customerRepository.findByCustomerId(card.customerId);
      if (customer) {
        response.customer = {
          customerId: customer.customerId,
          firstName: customer.firstName,
          lastName: customer.lastName,
        };
      }
    }

    if (includeTransactions) {
      const transactions = await this.transactionRepository.findRecentByCardNumber(
        card.cardNumber,
        10
      );
      response.recentTransactions = transactions.map((tx) => ({
        transactionId: tx.transactionId,
        date: tx.transactionDate.toISOString().split('T')[0],
        description: tx.merchantName,
        amount: tx.amount,
      }));
    }

    // Cache the result
    await this.cacheService.set(cacheKey, response);

    // Audit logging
    this.auditService.logCardAccess(card.cardNumber, userId, userRole, true);
    if (userRole === UserRole.ADMIN) {
      this.auditService.logFullCardNumberAccess(card.cardNumber, userId);
    }

    return response;
  }

  private extractCardNumber(input: string): string {
    // If input contains asterisks, extract last 4 digits
    if (input.includes('*')) {
      const matches = input.match(/\d{4}$/);
      if (matches) {
        return matches[0];
      }
    }
    return input;
  }

  private validateCardNumber(cardNumber: string): void {
    const cardNumberRegex = /^\d{4,16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
      throw new ValidationException('Invalid card number format');
    }
  }

  private checkPermission(cardCustomerId: string, userId: string, userRole: UserRole): void {
    // Admins and CSRs can access any card
    if (userRole === UserRole.ADMIN || userRole === UserRole.CSR) {
      return;
    }

    // Customers can only access their own cards
    if (userRole === UserRole.CUSTOMER && cardCustomerId !== userId) {
      throw new ForbiddenException('Access forbidden');
    }
  }
}
