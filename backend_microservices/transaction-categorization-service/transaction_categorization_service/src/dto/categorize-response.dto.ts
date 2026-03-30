export interface CategorizeResponse {
  transactionType: string;
  transactionTypeName: string;
  transactionCategory: string;
  categoryName: string;
  categoryGroup: string;
  interestRate: number;
  rewardsEligible: boolean;
  rewardsRate: number;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  uptime: number;
  database?: 'UP' | 'DOWN';
}
