import apiClient from './api';
import type { Account, AccountDetail, AccountSearchParams } from '@/types/account';
import type { PaginatedResponse } from '@/types/api';

// Account service
export const accountService = {
  // Search accounts
  searchAccounts: async (params: AccountSearchParams): Promise<PaginatedResponse<Account>> => {
    const response = await apiClient.post<PaginatedResponse<Account>>('/api/v1/accounts/search', params);
    return response.data;
  },

  // Get account details
  getAccountDetail: async (accountNumber: string): Promise<AccountDetail> => {
    const response = await apiClient.get<AccountDetail>(`/api/v1/accounts/${accountNumber}`);
    return response.data;
  },

  // Update account
  updateAccount: async (accountNumber: string, data: Partial<Account>): Promise<Account> => {
    const response = await apiClient.put<Account>(`/api/v1/accounts/${accountNumber}`, data);
    return response.data;
  },

  // Get account balance
  getAccountBalance: async (accountNumber: string): Promise<{ balance: number; availableBalance: number }> => {
    const response = await apiClient.get(`/api/v1/accounts/${accountNumber}/balance`);
    return response.data;
  },
};
