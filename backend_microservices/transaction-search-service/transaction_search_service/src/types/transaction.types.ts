export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AmountRange {
  min: number;
  max: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface TransactionSearchRequest {
  accountId?: string;
  cardNumber?: string;
  dateRange?: DateRange;
  amountRange?: AmountRange;
  transactionTypes?: string[];
  merchantName?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  pagination: Pagination;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  cardNumber: string;
  transactionType: string;
  transactionTypeName: string;
  transactionCategory: string;
  amount: number;
  description: string;
  merchantName: string;
  merchantCity: string;
  originalTimestamp: string;
  postedTimestamp: string;
  status: string;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}

export interface SearchMetadata {
  executionTimeMs: number;
  appliedFilters: string[];
  sortedBy: string;
  sortOrder: string;
}

export interface TransactionSearchResponse {
  results: Transaction[];
  pagination: PaginationMetadata;
  searchMetadata: SearchMetadata;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}
