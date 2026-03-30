import { FeeAssessmentRequestDto } from '../dtos/fee-assessment-request.dto';
import { FeeAssessmentResponseDto } from '../dtos/fee-assessment-response.dto';
import { IAccountRepository } from '../repositories/account.repository';
import { ITransactionRepository } from '../repositories/transaction.repository';
import { IAuditService } from './audit.service';
import { NotFoundError, BusinessError } from '../middleware/error-handler.middleware';
import { generateTransactionId } from '../utils/id-generator';
import { FeeTypeDescriptions, TRANSACTION_TYPE_FEE } from '../types/fee-types';

export interface IFeeService {
  assessFee(request: FeeAssessmentRequestDto): Promise<FeeAssessmentResponseDto>;
}

export class FeeService implements IFeeService {
  constructor(
    private accountRepository: IAccountRepository,
    private transactionRepository: ITransactionRepository,
    private auditService: IAuditService
  ) {}

  async assessFee(request: FeeAssessmentRequestDto): Promise<FeeAssessmentResponseDto> {
    this.auditService.logFeeAssessment({
      accountId: request.accountId,
      feeType: request.feeType,
      amount: request.amount,
    });

    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new NotFoundError(`Account not found: ${request.accountId}`);
    }

    if (account.status !== 'active') {
      throw new BusinessError(`Account is not active: ${account.status}`);
    }

    const transactionId = generateTransactionId();
    const description = `${FeeTypeDescriptions[request.feeType]} - ${request.reason}`;

    const transaction = await this.transactionRepository.create({
      transactionId,
      accountId: request.accountId,
      transactionType: TRANSACTION_TYPE_FEE,
      amount: request.amount,
      description,
      status: 'posted',
    });

    const newBalance = account.balance + request.amount;
    await this.accountRepository.updateBalance(request.accountId, newBalance);

    this.auditService.logFeePosted({
      accountId: request.accountId,
      transactionId: transaction.transactionId,
      feeType: request.feeType,
      amount: request.amount,
      newBalance,
    });

    return {
      accountId: request.accountId,
      feeType: request.feeType,
      amount: request.amount,
      transactionId: transaction.transactionId,
      posted: true,
    };
  }
}
