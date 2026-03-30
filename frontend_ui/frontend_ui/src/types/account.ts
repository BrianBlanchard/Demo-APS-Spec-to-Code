// Account types
export interface Account {
  accountNumber: string;
  accountType: string;
  accountStatus: string;
  customerId: string;
  customerName: string;
  balance: number;
  availableBalance: number;
  currency: string;
  openDate: string;
  lastActivityDate: string;
}

export interface AccountDetail extends Account {
  interestRate?: number;
  overdraftLimit?: number;
  transactions?: Transaction[];
}

export interface AccountSearchParams {
  accountNumber?: string;
  customerId?: string;
  customerName?: string;
  accountType?: string;
  accountStatus?: string;
}

export interface Transaction {
  transactionId: string;
  transactionDate: string;
  transactionType: string;
  amount: number;
  description: string;
  balance: number;
  status: string;
}
