import { AccountStatus, AccountType } from './enums';

export interface Account {
  id: number;
  account_id: string;
  customer_id: number;
  status: AccountStatus;
  account_type: AccountType;
  credit_limit: number;
  cash_advance_limit: number;
  opening_date: Date;
  expiration_date: Date;
  reissuance_date: Date | null;
  disclosure_group_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface AccountBalance {
  id: number;
  account_id: number;
  current_balance: number;
  available_credit: number;
  cash_advance_balance: number;
  pending_amount: number;
  last_interest_amount: number | null;
  last_interest_date: Date | null;
  version: number;
  updated_at: Date;
}

export interface Customer {
  id: number;
  customer_id: string;
  kyc_status: string;
}

export interface DisclosureGroup {
  id: number;
  disclosure_group_code: string;
  description: string | null;
}

export interface AccountTypeConfig {
  account_type: AccountType;
  term_months: number;
}
