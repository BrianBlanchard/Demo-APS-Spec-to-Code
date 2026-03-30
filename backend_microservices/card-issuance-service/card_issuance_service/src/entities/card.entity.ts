import { CardStatus } from '../types/card-status.enum';

export interface CardEntity {
  id: number;
  card_number: string; // Encrypted
  last_four_digits: string;
  account_id: string;
  status: CardStatus;
  expiration_date: Date;
  embossed_name?: string;
  created_at: Date;
  updated_at: Date;
}
