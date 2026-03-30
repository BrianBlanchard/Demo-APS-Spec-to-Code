export interface TransactionCategory {
  categoryCode: string;
  categoryName: string;
  transactionType: string;
  categoryGroup: string;
  interestRate: number;
  rewardsEligible: boolean;
  rewardsRate: number;
}
