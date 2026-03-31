import apiClient from './api';
import type { Transaction } from '../types/account';
import type { PaginatedResponse } from '../types/api';

export interface TransactionSearchParams {
  accountNumber?: string;
  startDate?: string;
  endDate?: string;
  transactionType?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionRequest {
  accountNumber: string;
  transactionType: string;
  amount: number;
  description: string;
}

// Transaction service
export const transactionService = {
  // Search transactions
  searchTransactions: async (params: TransactionSearchParams): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.post<PaginatedResponse<Transaction>>('/api/v1/transactions/search', params);
    return response.data;
  },

  // Create transaction
  createTransaction: async (data: TransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/api/v1/transactions', data);
    return response.data;
  },

  // Get transaction details
  getTransactionDetail: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/api/v1/transactions/${transactionId}`);
    return response.data;
  },
};
