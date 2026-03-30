export enum CardStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export interface Card {
  cardNumber: string;
  accountId: string;
  cvv: string;
  expirationDate: Date;
  status: CardStatus;
  dailyTransactionLimit: number;
  dailyTransactionCount: number;
  lastTransactionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
