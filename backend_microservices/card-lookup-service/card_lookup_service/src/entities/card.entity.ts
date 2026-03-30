import { CardStatus } from '../types/card-status.type';

export interface CardEntity {
  cardNumber: string;
  accountId: string;
  customerId: string;
  embossedName: string;
  cvv: string;
  status: CardStatus;
  expirationDate: string;
  issuedDate: string;
  createdAt: Date;
  updatedAt: Date;
}
