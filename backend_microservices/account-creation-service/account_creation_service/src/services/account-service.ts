import { Pool } from 'pg';
import { CreateAccountRequest, AccountResponse } from '../types/dtos';
import { AccountRepository } from '../repositories/account-repository';
import { CustomerRepository } from '../repositories/customer-repository';
import { DisclosureGroupRepository } from '../repositories/disclosure-group-repository';
import { AccountTypeConfigRepository } from '../repositories/account-type-config-repository';
import { AuditService } from './audit-service';
import { AccountStatus, KycStatus } from '../types/enums';
import {
  ValidationError,
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
} from '../errors/application-errors';
import config from '../config/config';
import logger from '../logger/logger';

export interface AccountService {
  createAccount(request: CreateAccountRequest): Promise<AccountResponse>;
}

export class AccountServiceImpl implements AccountService {
  constructor(
    private readonly pool: Pool,
    private readonly accountRepository: AccountRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly disclosureGroupRepository: DisclosureGroupRepository,
    private readonly accountTypeConfigRepository: AccountTypeConfigRepository,
    private readonly auditService: AuditService
  ) {}

  async createAccount(request: CreateAccountRequest): Promise<AccountResponse> {
    // Validate business rules
    await this.validateBusinessRules(request);

    // Validate customer and KYC status
    const customer = await this.customerRepository.findByCustomerId(request.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found', request.customerId);
    }

    if (customer.kyc_status !== KycStatus.VERIFIED) {
      throw new UnprocessableEntityError(
        'Account creation requires KYC status = VERIFIED per regulatory requirements (NFR-006)',
        {
          customerId: request.customerId,
          kycStatus: customer.kyc_status,
        }
      );
    }

    // Validate disclosure group
    const disclosureGroup = await this.disclosureGroupRepository.findByCode(
      request.disclosureGroupCode
    );
    if (!disclosureGroup) {
      throw new UnprocessableEntityError('Disclosure group not found', {
        disclosureGroupCode: request.disclosureGroupCode,
      });
    }

    // Calculate dates
    const openingDate = new Date();
    const termMonths = await this.getAccountTermMonths(request.accountType);
    const expirationDate = this.calculateExpirationDate(openingDate, termMonths);
    const reissuanceDate = this.calculateReissuanceDate(expirationDate);

    // Generate unique account ID
    const accountId = await this.accountRepository.generateAccountId();

    // Create account and account balance in a transaction
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const account = await this.accountRepository.createAccount(
        {
          account_id: accountId,
          customer_id: customer.id,
          status: AccountStatus.NEW,
          account_type: request.accountType,
          credit_limit: request.creditLimit,
          cash_advance_limit: request.cashAdvanceLimit,
          opening_date: openingDate,
          expiration_date: expirationDate,
          reissuance_date: reissuanceDate,
          disclosure_group_id: disclosureGroup.id,
        },
        client
      );

      const accountBalance = await this.accountRepository.createAccountBalance(
        account.id,
        request.creditLimit,
        client
      );

      await client.query('COMMIT');

      logger.info({ accountId: account.account_id }, 'Account created successfully');

      // Create audit log (async, non-blocking)
      void this.auditService.logAccountCreation(account.account_id, {
        customerId: request.customerId,
        accountType: request.accountType,
        creditLimit: request.creditLimit,
        cashAdvanceLimit: request.cashAdvanceLimit,
        disclosureGroupCode: request.disclosureGroupCode,
      });

      return this.mapToAccountResponse(
        account,
        accountBalance,
        request.customerId,
        request.disclosureGroupCode
      );
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({ error }, 'Failed to create account');
      throw new InternalServerError('Failed to create account');
    } finally {
      client.release();
    }
  }

  private async validateBusinessRules(request: CreateAccountRequest): Promise<void> {
    const errors: Array<{ field: string; message: string }> = [];

    // BR-009: Cash advance limit must not exceed credit limit
    if (request.cashAdvanceLimit > request.creditLimit) {
      errors.push({
        field: 'cashAdvanceLimit',
        message: 'Cash advance limit cannot exceed credit limit (BR-009)',
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private async getAccountTermMonths(accountType: string): Promise<number> {
    const accountTypeConfig = await this.accountTypeConfigRepository.findByAccountType(
      accountType as any
    );

    return accountTypeConfig?.term_months || config.account.defaultTermMonths;
  }

  private calculateExpirationDate(openingDate: Date, termMonths: number): Date {
    const expirationDate = new Date(openingDate);
    expirationDate.setMonth(expirationDate.getMonth() + termMonths);
    return expirationDate;
  }

  private calculateReissuanceDate(expirationDate: Date): Date {
    const reissuanceDate = new Date(expirationDate);
    reissuanceDate.setDate(reissuanceDate.getDate() - config.account.reissuanceWindowDays);
    return reissuanceDate;
  }

  private mapToAccountResponse(
    account: any,
    accountBalance: any,
    customerId: string,
    disclosureGroupCode: string
  ): AccountResponse {
    return {
      id: account.id,
      accountId: account.account_id,
      customerId,
      status: account.status,
      accountType: account.account_type,
      creditLimit: parseFloat(account.credit_limit),
      cashAdvanceLimit: parseFloat(account.cash_advance_limit),
      currentBalance: parseFloat(accountBalance.current_balance),
      availableCredit: parseFloat(accountBalance.available_credit),
      openingDate: account.opening_date.toISOString().split('T')[0],
      expirationDate: account.expiration_date.toISOString().split('T')[0],
      disclosureGroupCode,
      createdAt: account.created_at.toISOString(),
      updatedAt: account.updated_at.toISOString(),
    };
  }
}
