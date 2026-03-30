import { Knex } from 'knex';
import { TransactionSearchRequest, Transaction } from '../types';
import { maskCardNumber } from '../utils/mask.util';
import { logger } from '../utils/logger';

export interface ITransactionRepository {
  searchTransactions(request: TransactionSearchRequest): Promise<Transaction[]>;
}

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly db: Knex) {}

  async searchTransactions(request: TransactionSearchRequest): Promise<Transaction[]> {
    try {
      let query = this.db('transactions').select('*');

      // Apply filters
      if (request.accountId) {
        query = query.where('account_id', request.accountId);
      }

      if (request.cardNumber) {
        query = query.where('card_number', request.cardNumber);
      }

      if (request.dateRange) {
        query = query
          .where('original_timestamp', '>=', request.dateRange.startDate)
          .where('original_timestamp', '<=', request.dateRange.endDate);
      }

      if (request.amountRange) {
        query = query
          .where('amount', '>=', request.amountRange.min)
          .where('amount', '<=', request.amountRange.max);
      }

      if (request.transactionTypes && request.transactionTypes.length > 0) {
        query = query.whereIn('transaction_type', request.transactionTypes);
      }

      if (request.merchantName) {
        query = query.where('merchant_name', 'ilike', `%${request.merchantName}%`);
      }

      // Apply sorting
      const sortBy = request.sortBy === 'amount' ? 'amount' : 'original_timestamp';
      const sortOrder = request.sortOrder === 'asc' ? 'asc' : 'desc';
      query = query.orderBy(sortBy, sortOrder);

      const results = await query;

      // Map database results to domain model and mask sensitive data
      return results.map((row) => ({
        transactionId: row.transaction_id,
        accountId: row.account_id,
        cardNumber: maskCardNumber(row.card_number),
        transactionType: row.transaction_type,
        transactionTypeName: this.getTransactionTypeName(row.transaction_type),
        transactionCategory: row.transaction_category,
        amount: parseFloat(row.amount),
        description: row.description,
        merchantName: row.merchant_name,
        merchantCity: row.merchant_city,
        originalTimestamp: row.original_timestamp,
        postedTimestamp: row.posted_timestamp,
        status: row.status,
      }));
    } catch (error) {
      logger.error({ error }, 'Error searching transactions in database');
      throw error;
    }
  }

  private getTransactionTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      '01': 'Purchase',
      '02': 'Withdrawal',
      '03': 'Refund',
      '04': 'Payment',
      '05': 'Transfer',
    };
    return typeMap[type] || 'Unknown';
  }
}
