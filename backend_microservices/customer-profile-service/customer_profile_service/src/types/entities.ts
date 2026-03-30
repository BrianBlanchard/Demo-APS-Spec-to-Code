export interface CustomerEntity {
  customer_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: Date;
  ssn: string;
  government_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone1: string;
  phone2?: string;
  eft_account_id: string;
  is_primary_cardholder: boolean;
  fico_score?: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  version: number;
}

export interface AccountEntity {
  account_id: string;
  customer_id: string;
  status: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogEntity {
  audit_id?: string;
  customer_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_at?: Date;
  changed_by: string;
  ip_address: string;
  trace_id?: string;
}
