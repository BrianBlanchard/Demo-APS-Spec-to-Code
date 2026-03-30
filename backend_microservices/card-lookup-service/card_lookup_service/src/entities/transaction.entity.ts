export interface TransactionEntity {
  transactionId: string;
  cardNumber: string;
  accountId: string;
  transactionDate: Date;
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}
