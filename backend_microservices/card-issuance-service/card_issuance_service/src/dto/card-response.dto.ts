import { CardStatus } from '../types/card-status.enum';

export interface CardResponseDto {
  id: number;
  cardNumber: string; // Masked format
  lastFourDigits: string;
  accountId: string;
  status: CardStatus;
  expirationDate: string;
  embossedName?: string;
  createdAt: string;
  updatedAt: string;
}
