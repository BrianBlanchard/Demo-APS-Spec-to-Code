import {
  TransactionSearchRequest,
  TransactionSearchResponse,
  PaginationMetadata,
  SearchMetadata,
} from '../types';
import { ITransactionRepository } from '../repositories/transaction.repository';
import { IAuditService } from './audit.service';
import { IAuthorizationService } from './authorization.service';
import { getRequestContext } from '../utils/context.storage';
import { AppError } from '../middleware/error.middleware';

export interface ITransactionSearchService {
  searchTransactions(request: TransactionSearchRequest): Promise<TransactionSearchResponse>;
}

export class TransactionSearchService implements ITransactionSearchService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly auditService: IAuditService,
    private readonly authorizationService: IAuthorizationService
  ) {}

  async searchTransactions(
    request: TransactionSearchRequest
  ): Promise<TransactionSearchResponse> {
    const startTime = Date.now();
    const context = getRequestContext();

    // Log search attempt
    this.auditService.logSearchAttempt(request.accountId, context?.userId);

    try {
      // Validate access permissions
      this.authorizationService.validateAccountAccess(request.accountId);
      this.authorizationService.validateCardAccess(request.cardNumber);

      // Execute search
      const transactions = await this.transactionRepository.searchTransactions(request);

      // Calculate pagination metadata
      const totalResults = transactions.length;
      const totalPages = Math.ceil(totalResults / request.pagination.pageSize);

      // Paginate results
      const startIndex = (request.pagination.page - 1) * request.pagination.pageSize;
      const endIndex = startIndex + request.pagination.pageSize;
      const paginatedResults = transactions.slice(startIndex, endIndex);

      // Build applied filters list
      const appliedFilters: string[] = [];
      if (request.dateRange) appliedFilters.push('dateRange');
      if (request.amountRange) appliedFilters.push('amountRange');
      if (request.transactionTypes && request.transactionTypes.length > 0)
        appliedFilters.push('transactionTypes');
      if (request.merchantName) appliedFilters.push('merchantName');
      if (request.accountId) appliedFilters.push('accountId');
      if (request.cardNumber) appliedFilters.push('cardNumber');

      // Log success
      this.auditService.logSearchSuccess(totalResults, request.accountId, context?.userId);

      // Check if results exceed maximum
      const maxResults = parseInt(process.env.ELASTICSEARCH_MAX_RESULTS || '10000', 10);
      if (totalResults > maxResults) {
        // In a real implementation, you might want to add a warning to the response
        // For now, we'll just log it
        this.auditService.logSearchAttempt(
          request.accountId,
          context?.userId
        );
      }

      const executionTimeMs = Date.now() - startTime;

      const pagination: PaginationMetadata = {
        currentPage: request.pagination.page,
        pageSize: request.pagination.pageSize,
        totalResults,
        totalPages,
      };

      const searchMetadata: SearchMetadata = {
        executionTimeMs,
        appliedFilters,
        sortedBy: request.sortBy || 'date',
        sortOrder: request.sortOrder || 'desc',
      };

      return {
        results: paginatedResults,
        pagination,
        searchMetadata,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      this.auditService.logSearchFailure(
        error instanceof Error ? error.message : 'Unknown error',
        request.accountId,
        context?.userId
      );

      throw new AppError(
        500,
        'SEARCH_ERROR',
        'An error occurred while searching transactions'
      );
    }
  }
}
