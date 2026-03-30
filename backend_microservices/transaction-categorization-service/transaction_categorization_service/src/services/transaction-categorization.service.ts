import type { ITransactionCategoryRepository } from '../repositories/transaction-category.repository';
import type { IAuditService } from './audit.service';
import type { CategorizeRequest } from '../dto/categorize-request.dto';
import type { CategorizeResponse } from '../dto/categorize-response.dto';
import type { TransactionCategory } from '../entities/transaction-category.entity';
import logger from '../utils/logger';

const TRANSACTION_TYPE_NAMES: Record<string, string> = {
  '01': 'Purchase',
  '02': 'Cash Advance',
  '03': 'Balance Transfer',
  '04': 'Payment',
  '05': 'Fee',
  '06': 'Interest',
} as const;

const DEFAULT_CATEGORY = {
  categoryCode: '9999',
  categoryName: 'Other',
  transactionType: '01',
  categoryGroup: 'other',
  interestRate: 19.99,
  rewardsEligible: false,
  rewardsRate: 0.0,
} as const;

export interface ITransactionCategorizationService {
  categorizeTransaction(request: CategorizeRequest): Promise<CategorizeResponse>;
}

export class TransactionCategorizationService implements ITransactionCategorizationService {
  constructor(
    private readonly categoryRepository: ITransactionCategoryRepository,
    private readonly auditService: IAuditService
  ) {}

  async categorizeTransaction(request: CategorizeRequest): Promise<CategorizeResponse> {
    logger.info({ mcc: request.merchantCategoryCode }, 'Categorizing transaction');

    this.auditService.logOperation('categorize_transaction', 'success', {
      merchantCategoryCode: request.merchantCategoryCode,
      merchantName: request.merchantName,
      amount: request.amount,
    });

    const category = await this.categoryRepository.findByMcc(request.merchantCategoryCode);

    if (!category) {
      logger.warn(
        { mcc: request.merchantCategoryCode },
        'Unknown MCC, assigning default category'
      );

      this.auditService.logOperation(
        'unknown_mcc',
        'success',
        {
          merchantCategoryCode: request.merchantCategoryCode,
          assignedCategory: DEFAULT_CATEGORY.categoryCode,
        },
        'MCC not found in mapping table'
      );

      return this.mapToResponse(DEFAULT_CATEGORY);
    }

    logger.info(
      {
        mcc: request.merchantCategoryCode,
        category: category.categoryName,
      },
      'Transaction categorized successfully'
    );

    return this.mapToResponse(category);
  }

  private mapToResponse(
    category: TransactionCategory | typeof DEFAULT_CATEGORY
  ): CategorizeResponse {
    const transactionTypeName =
      TRANSACTION_TYPE_NAMES[category.transactionType] || 'Unknown';

    return {
      transactionType: category.transactionType,
      transactionTypeName,
      transactionCategory: category.categoryCode,
      categoryName: category.categoryName,
      categoryGroup: category.categoryGroup,
      interestRate: category.interestRate,
      rewardsEligible: category.rewardsEligible,
      rewardsRate: category.rewardsRate,
    };
  }
}
