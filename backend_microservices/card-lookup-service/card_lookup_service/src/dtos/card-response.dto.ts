import { CardStatus } from '../types/card-status.type';

export interface CardResponseDto {
  cardNumber: string;
  accountId: string;
  customerId: string;
  embossedName: string;
  status: CardStatus;
  expirationDate: string;
  issuedDate: string;
  account?: AccountResponseDto;
  customer?: CustomerResponseDto;
  recentTransactions?: TransactionResponseDto[];
}

export interface AccountResponseDto {
  accountId: string;
  status: string;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
}

export interface CustomerResponseDto {
  customerId: string;
  firstName: string;
  lastName: string;
}

export interface TransactionResponseDto {
  transactionId: string;
  date: string;
  description: string;
  amount: number;
}
