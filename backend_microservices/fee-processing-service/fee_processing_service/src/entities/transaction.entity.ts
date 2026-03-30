export interface Transaction {
  transactionId: string;
  accountId: string;
  transactionType: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
}
